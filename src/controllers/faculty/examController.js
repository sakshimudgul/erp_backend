const { Exam, Subject, Result, Student, User } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const examController = {
  // Get subject exams
  getSubjectExams: async (req, res) => {
    try {
      const { subjectId } = req.params;

      const exams = await Exam.findAll({
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
        order: [['date', 'ASC']]
      });

      res.status(200).json(new ApiResponse(true, 'Exams retrieved', { exams }, 200));
    } catch (error) {
      logger.error('Get subject exams error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get exams', null, 500));
    }
  },

  // Create exam
  createExam: async (req, res) => {
    try {
      const { subjectId } = req.params;
      const {
        name,
        type,
        maxMarks,
        passingMarks,
        date,
        duration,
        venue
      } = req.body;

      const exam = await Exam.create({
        subjectId,
        name,
        type,
        maxMarks,
        passingMarks,
        date,
        duration,
        venue,
        createdBy: req.userId,
        isPublished: false
      });

      const createdExam = await Exam.findByPk(exam.id, {
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

      res.status(201).json(new ApiResponse(true, 'Exam created', { exam: createdExam }, 201));
    } catch (error) {
      logger.error('Create exam error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to create exam', null, 500));
    }
  },

  // Get exam by ID
  getExamById: async (req, res) => {
    try {
      const { id } = req.params;

      const exam = await Exam.findByPk(id, {
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
            model: Result,
            as: 'results',
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

      if (!exam) {
        return res.status(404).json(new ApiResponse(false, 'Exam not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'Exam retrieved', { exam }, 200));
    } catch (error) {
      logger.error('Get exam by ID error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get exam', null, 500));
    }
  },

  // Update exam
  updateExam: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const exam = await Exam.findByPk(id);
      if (!exam) {
        return res.status(404).json(new ApiResponse(false, 'Exam not found', null, 404));
      }

      await exam.update(updates);

      const updatedExam = await Exam.findByPk(id, {
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

      res.status(200).json(new ApiResponse(true, 'Exam updated', { exam: updatedExam }, 200));
    } catch (error) {
      logger.error('Update exam error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update exam', null, 500));
    }
  },

  // Delete exam
  deleteExam: async (req, res) => {
    try {
      const { id } = req.params;

      const exam = await Exam.findByPk(id);
      if (!exam) {
        return res.status(404).json(new ApiResponse(false, 'Exam not found', null, 404));
      }

      await exam.destroy();

      res.status(200).json(new ApiResponse(true, 'Exam deleted', null, 200));
    } catch (error) {
      logger.error('Delete exam error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to delete exam', null, 500));
    }
  },

  // Schedule exam
  scheduleExam: async (req, res) => {
    try {
      const { id } = req.params;
      const { date, duration, venue } = req.body;

      const exam = await Exam.findByPk(id);
      if (!exam) {
        return res.status(404).json(new ApiResponse(false, 'Exam not found', null, 404));
      }

      await exam.update({ date, duration, venue });

      res.status(200).json(new ApiResponse(true, 'Exam scheduled', { exam }, 200));
    } catch (error) {
      logger.error('Schedule exam error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to schedule exam', null, 500));
    }
  },

  // Reschedule exam
  rescheduleExam: async (req, res) => {
    try {
      const { id } = req.params;
      const { date, duration, venue } = req.body;

      const exam = await Exam.findByPk(id);
      if (!exam) {
        return res.status(404).json(new ApiResponse(false, 'Exam not found', null, 404));
      }

      await exam.update({ date, duration, venue });

      res.status(200).json(new ApiResponse(true, 'Exam rescheduled', { exam }, 200));
    } catch (error) {
      logger.error('Reschedule exam error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to reschedule exam', null, 500));
    }
  },

  // Get exam results
  getExamResults: async (req, res) => {
    try {
      const { id } = req.params;

      const results = await Result.findAll({
        where: { examId: id },
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

      res.status(200).json(new ApiResponse(true, 'Exam results retrieved', { results }, 200));
    } catch (error) {
      logger.error('Get exam results error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get exam results', null, 500));
    }
  },

  // Upload results
  uploadResults: async (req, res) => {
    try {
      const { id } = req.params;
      const { results } = req.body;

      // results is an array of { studentId, marksObtained, grade, gradePoints, remarks }

      const uploaded = [];
      for (const item of results) {
        let result = await Result.findOne({
          where: {
            studentId: item.studentId,
            examId: id
          }
        });

        if (result) {
          await result.update({
            marksObtained: item.marksObtained,
            grade: item.grade,
            gradePoints: item.gradePoints,
            remarks: item.remarks,
            enteredBy: req.userId,
            isPublished: false
          });
        } else {
          result = await Result.create({
            studentId: item.studentId,
            examId: id,
            marksObtained: item.marksObtained,
            grade: item.grade,
            gradePoints: item.gradePoints,
            remarks: item.remarks,
            enteredBy: req.userId,
            isPublished: false
          });
        }
        uploaded.push(result);
      }

      res.status(200).json(new ApiResponse(true, 'Results uploaded', { count: uploaded.length }, 200));
    } catch (error) {
      logger.error('Upload results error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to upload results', null, 500));
    }
  }
};

module.exports = examController;