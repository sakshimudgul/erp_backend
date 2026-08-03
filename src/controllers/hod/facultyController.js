const { Faculty, User, Department, Subject } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const facultyController = {
  // Get all faculty
  getFaculty: async (req, res) => {
    try {
      const { page, limit, offset, filters } = parseQueryParams(req.query);

      const where = {};
      if (filters.departmentId) where.departmentId = filters.departmentId;
      if (filters.designation) where.designation = filters.designation;

      const { count, rows } = await Faculty.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profileImage']
          },
          {
            model: Department,
            as: 'department'
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Faculty retrieved', {
        faculty: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }, 200));
    } catch (error) {
      logger.error('Get faculty error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get faculty', null, 500));
    }
  },

  // Create faculty
  createFaculty: async (req, res) => {
    try {
      const { userId, departmentId, employeeId, designation, qualification, specialization, experience, joiningDate } = req.body;

      // Check if faculty already exists
      const existingFaculty = await Faculty.findOne({ where: { employeeId } });
      if (existingFaculty) {
        return res.status(400).json(new ApiResponse(false, 'Employee ID already exists', null, 400));
      }

      const faculty = await Faculty.create({
        userId,
        departmentId,
        employeeId,
        designation,
        qualification,
        specialization,
        experience,
        joiningDate
      });

      const createdFaculty = await Faculty.findByPk(faculty.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          },
          {
            model: Department,
            as: 'department'
          }
        ]
      });

      res.status(201).json(new ApiResponse(true, 'Faculty created', { faculty: createdFaculty }, 201));
    } catch (error) {
      logger.error('Create faculty error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to create faculty', null, 500));
    }
  },

  // Get faculty by ID
  getFacultyById: async (req, res) => {
    try {
      const { id } = req.params;

      const faculty = await Faculty.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profileImage']
          },
          {
            model: Department,
            as: 'department'
          },
          {
            model: Subject,
            as: 'subjects'
          }
        ]
      });

      if (!faculty) {
        return res.status(404).json(new ApiResponse(false, 'Faculty not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'Faculty retrieved', { faculty }, 200));
    } catch (error) {
      logger.error('Get faculty by ID error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get faculty', null, 500));
    }
  },

  // Update faculty
  updateFaculty: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const faculty = await Faculty.findByPk(id);
      if (!faculty) {
        return res.status(404).json(new ApiResponse(false, 'Faculty not found', null, 404));
      }

      await faculty.update(updates);

      const updatedFaculty = await Faculty.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          },
          {
            model: Department,
            as: 'department'
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Faculty updated', { faculty: updatedFaculty }, 200));
    } catch (error) {
      logger.error('Update faculty error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update faculty', null, 500));
    }
  },

  // Delete faculty
  deleteFaculty: async (req, res) => {
    try {
      const { id } = req.params;

      const faculty = await Faculty.findByPk(id);
      if (!faculty) {
        return res.status(404).json(new ApiResponse(false, 'Faculty not found', null, 404));
      }

      await faculty.destroy();

      res.status(200).json(new ApiResponse(true, 'Faculty deleted', null, 200));
    } catch (error) {
      logger.error('Delete faculty error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to delete faculty', null, 500));
    }
  },

  // Assign subject to faculty
  assignSubject: async (req, res) => {
    try {
      const { id } = req.params;
      const { subjectId } = req.body;

      const faculty = await Faculty.findByPk(id);
      if (!faculty) {
        return res.status(404).json(new ApiResponse(false, 'Faculty not found', null, 404));
      }

      const subject = await Subject.findByPk(subjectId);
      if (!subject) {
        return res.status(404).json(new ApiResponse(false, 'Subject not found', null, 404));
      }

      await subject.update({ facultyId: id });

      res.status(200).json(new ApiResponse(true, 'Subject assigned to faculty', null, 200));
    } catch (error) {
      logger.error('Assign subject error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to assign subject', null, 500));
    }
  },

  // Remove subject from faculty
  removeSubject: async (req, res) => {
    try {
      const { id, subjectId } = req.params;

      const subject = await Subject.findByPk(subjectId);
      if (!subject) {
        return res.status(404).json(new ApiResponse(false, 'Subject not found', null, 404));
      }

      if (subject.facultyId !== id) {
        return res.status(400).json(new ApiResponse(false, 'Subject not assigned to this faculty', null, 400));
      }

      await subject.update({ facultyId: null });

      res.status(200).json(new ApiResponse(true, 'Subject removed from faculty', null, 200));
    } catch (error) {
      logger.error('Remove subject error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to remove subject', null, 500));
    }
  },

  // Get faculty workload
  getFacultyWorkload: async (req, res) => {
    try {
      const { id } = req.params;

      const subjects = await Subject.findAll({
        where: { facultyId: id },
        attributes: ['id', 'name', 'code', 'credits']
      });

      const workload = {
        totalSubjects: subjects.length,
        totalCredits: subjects.reduce((sum, subject) => sum + subject.credits, 0),
        subjects
      };

      res.status(200).json(new ApiResponse(true, 'Faculty workload retrieved', { workload }, 200));
    } catch (error) {
      logger.error('Get faculty workload error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get faculty workload', null, 500));
    }
  },

  // Update workload
  updateWorkload: async (req, res) => {
    try {
      const { id } = req.params;
      const { maxHoursPerWeek } = req.body;

      const faculty = await Faculty.findByPk(id);
      if (!faculty) {
        return res.status(404).json(new ApiResponse(false, 'Faculty not found', null, 404));
      }

      await faculty.update({ maxHoursPerWeek });

      res.status(200).json(new ApiResponse(true, 'Workload updated', null, 200));
    } catch (error) {
      logger.error('Update workload error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update workload', null, 500));
    }
  },

  // Get faculty leaves
  getFacultyLeaves: async (req, res) => {
    try {
      const { id } = req.params;

      // Implementation depends on Leave model
      // For now, returning placeholder
      res.status(200).json(new ApiResponse(true, 'Faculty leaves retrieved', { leaves: [] }, 200));
    } catch (error) {
      logger.error('Get faculty leaves error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get faculty leaves', null, 500));
    }
  },

  // Apply leave
  applyLeave: async (req, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate, reason } = req.body;

      // Implementation depends on Leave model
      // For now, returning placeholder
      res.status(200).json(new ApiResponse(true, 'Leave applied successfully', null, 200));
    } catch (error) {
      logger.error('Apply leave error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to apply leave', null, 500));
    }
  },

  // Update leave status
  updateLeaveStatus: async (req, res) => {
    try {
      const { leaveId } = req.params;
      const { status } = req.body;

      // Implementation depends on Leave model
      // For now, returning placeholder
      res.status(200).json(new ApiResponse(true, 'Leave status updated', null, 200));
    } catch (error) {
      logger.error('Update leave status error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update leave status', null, 500));
    }
  }
};

module.exports = facultyController;