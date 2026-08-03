const { Assignment, Subject, Submission, Student, User } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const assignmentController = {
  // Get subject assignments
  getSubjectAssignments: async (req, res) => {
    try {
      const { subjectId } = req.params;

      const assignments = await Assignment.findAll({
        where: { subjectId },
        include: [
          {
            model: Subject,
            as: 'subject'
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json(new ApiResponse(true, 'Assignments retrieved', { assignments }, 200));
    } catch (error) {
      logger.error('Get subject assignments error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get assignments', null, 500));
    }
  },

  // Create assignment
  createAssignment: async (req, res) => {
    try {
      const { subjectId } = req.params;
      const { title, description, maxMarks, dueDate } = req.body;

      const assignment = await Assignment.create({
        subjectId,
        title,
        description,
        maxMarks,
        dueDate,
        createdBy: req.userId,
        isPublished: false
      });

      if (req.file) {
        await assignment.update({ attachment: req.file.path });
      }

      const createdAssignment = await Assignment.findByPk(assignment.id, {
        include: [
          {
            model: Subject,
            as: 'subject'
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

      res.status(201).json(new ApiResponse(true, 'Assignment created', { assignment: createdAssignment }, 201));
    } catch (error) {
      logger.error('Create assignment error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to create assignment', null, 500));
    }
  },

  // Get assignment by ID
  getAssignmentById: async (req, res) => {
    try {
      const { id } = req.params;

      const assignment = await Assignment.findByPk(id, {
        include: [
          {
            model: Subject,
            as: 'subject'
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: Submission,
            as: 'submissions',
            include: [
              {
                model: Student,
                as: 'student',
                include: [
                  {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!assignment) {
        return res.status(404).json(new ApiResponse(false, 'Assignment not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'Assignment retrieved', { assignment }, 200));
    } catch (error) {
      logger.error('Get assignment by ID error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get assignment', null, 500));
    }
  },

  // Update assignment
  updateAssignment: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const assignment = await Assignment.findByPk(id);
      if (!assignment) {
        return res.status(404).json(new ApiResponse(false, 'Assignment not found', null, 404));
      }

      await assignment.update(updates);

      if (req.file) {
        await assignment.update({ attachment: req.file.path });
      }

      const updatedAssignment = await Assignment.findByPk(id, {
        include: [
          {
            model: Subject,
            as: 'subject'
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Assignment updated', { assignment: updatedAssignment }, 200));
    } catch (error) {
      logger.error('Update assignment error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update assignment', null, 500));
    }
  },

  // Delete assignment
  deleteAssignment: async (req, res) => {
    try {
      const { id } = req.params;

      const assignment = await Assignment.findByPk(id);
      if (!assignment) {
        return res.status(404).json(new ApiResponse(false, 'Assignment not found', null, 404));
      }

      await assignment.destroy();

      res.status(200).json(new ApiResponse(true, 'Assignment deleted', null, 200));
    } catch (error) {
      logger.error('Delete assignment error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to delete assignment', null, 500));
    }
  },

  // Get submissions
  getSubmissions: async (req, res) => {
    try {
      const { id } = req.params;

      const submissions = await Submission.findAll({
        where: { assignmentId: id },
        include: [
          {
            model: Student,
            as: 'student',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
              }
            ]
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Submissions retrieved', { submissions }, 200));
    } catch (error) {
      logger.error('Get submissions error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get submissions', null, 500));
    }
  },

  // Get student submission
  getStudentSubmission: async (req, res) => {
    try {
      const { id, studentId } = req.params;

      const submission = await Submission.findOne({
        where: {
          assignmentId: id,
          studentId
        },
        include: [
          {
            model: Student,
            as: 'student',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
              }
            ]
          }
        ]
      });

      if (!submission) {
        return res.status(404).json(new ApiResponse(false, 'Submission not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'Student submission retrieved', { submission }, 200));
    } catch (error) {
      logger.error('Get student submission error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get student submission', null, 500));
    }
  },

  // Grade submission
  gradeSubmission: async (req, res) => {
    try {
      const { id, studentId } = req.params;
      const { marks, feedback } = req.body;

      const submission = await Submission.findOne({
        where: {
          assignmentId: id,
          studentId
        }
      });

      if (!submission) {
        return res.status(404).json(new ApiResponse(false, 'Submission not found', null, 404));
      }

      await submission.update({
        marks,
        feedback,
        gradedBy: req.userId,
        gradedAt: new Date()
      });

      res.status(200).json(new ApiResponse(true, 'Submission graded', { submission }, 200));
    } catch (error) {
      logger.error('Grade submission error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to grade submission', null, 500));
    }
  },

  // Get assignment statistics
  getAssignmentStatistics: async (req, res) => {
    try {
      const { id } = req.params;

      const totalSubmissions = await Submission.count({ where: { assignmentId: id } });
      const gradedSubmissions = await Submission.count({
        where: { assignmentId: id, marks: { [Op.ne]: null } }
      });
      const averageMarks = await Submission.findOne({
        where: { assignmentId: id },
        attributes: [[sequelize.fn('AVG', sequelize.col('marks')), 'average']]
      });

      const statistics = {
        totalSubmissions,
        gradedSubmissions,
        pendingGrading: totalSubmissions - gradedSubmissions,
        averageMarks: averageMarks?.get('average') || 0
      };

      res.status(200).json(new ApiResponse(true, 'Assignment statistics retrieved', { statistics }, 200));
    } catch (error) {
      logger.error('Get assignment statistics error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get assignment statistics', null, 500));
    }
  }
};

module.exports = assignmentController;