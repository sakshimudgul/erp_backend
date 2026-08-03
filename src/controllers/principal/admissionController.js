const { Student, User, Course } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams, generateRandomString } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const admissionController = {
  // Get all admissions
  getAdmissions: async (req, res) => {
    try {
      const { page, limit, offset, filters } = parseQueryParams(req.query);

      const where = {};
      if (filters.status) where.status = filters.status;
      if (filters.courseId) where.courseId = filters.courseId;

      const { count, rows } = await Student.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          },
          {
            model: Course,
            as: 'course'
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Admissions retrieved', {
        admissions: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }, 200));
    } catch (error) {
      logger.error('Get admissions error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get admissions', null, 500));
    }
  },

  // Get pending admissions
  getPendingAdmissions: async (req, res) => {
    try {
      const pendingAdmissions = await Student.findAll({
        where: { status: 'pending' },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          },
          {
            model: Course,
            as: 'course'
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Pending admissions retrieved', { admissions: pendingAdmissions }, 200));
    } catch (error) {
      logger.error('Get pending admissions error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get pending admissions', null, 500));
    }
  },

  // Get admission by ID
  getAdmissionById: async (req, res) => {
    try {
      const { id } = req.params;

      const admission = await Student.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          },
          {
            model: Course,
            as: 'course'
          }
        ]
      });

      if (!admission) {
        return res.status(404).json(new ApiResponse(false, 'Admission not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'Admission retrieved', { admission }, 200));
    } catch (error) {
      logger.error('Get admission by ID error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get admission', null, 500));
    }
  },

  // Create admission
  createAdmission: async (req, res) => {
    try {
      const {
        userId,
        courseId,
        batch,
        semester,
        admissionDate,
        admissionType,
        fatherName,
        motherName,
        address,
        emergencyContact,
        bloodGroup,
        guardianPhone
      } = req.body;

      // Check if student already has admission
      const existingStudent = await Student.findOne({ where: { userId } });
      if (existingStudent) {
        return res.status(400).json(new ApiResponse(false, 'Student already has an admission', null, 400));
      }

      // Generate enrollment number
      const enrollmentNumber = `EN${Date.now()}${generateRandomString(4).toUpperCase()}`;

      const student = await Student.create({
        userId,
        enrollmentNumber,
        courseId,
        batch,
        semester,
        admissionDate,
        admissionType,
        fatherName,
        motherName,
        address,
        emergencyContact,
        bloodGroup,
        guardianPhone,
        status: 'pending'
      });

      const createdAdmission = await Student.findByPk(student.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          },
          {
            model: Course,
            as: 'course'
          }
        ]
      });

      res.status(201).json(new ApiResponse(true, 'Admission created', { admission: createdAdmission }, 201));
    } catch (error) {
      logger.error('Create admission error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to create admission', null, 500));
    }
  },

  // Update admission
  updateAdmission: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const admission = await Student.findByPk(id);
      if (!admission) {
        return res.status(404).json(new ApiResponse(false, 'Admission not found', null, 404));
      }

      await admission.update(updates);

      const updatedAdmission = await Student.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          },
          {
            model: Course,
            as: 'course'
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Admission updated', { admission: updatedAdmission }, 200));
    } catch (error) {
      logger.error('Update admission error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update admission', null, 500));
    }
  },

  // Delete admission
  deleteAdmission: async (req, res) => {
    try {
      const { id } = req.params;

      const admission = await Student.findByPk(id);
      if (!admission) {
        return res.status(404).json(new ApiResponse(false, 'Admission not found', null, 404));
      }

      await admission.destroy();

      res.status(200).json(new ApiResponse(true, 'Admission deleted', null, 200));
    } catch (error) {
      logger.error('Delete admission error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to delete admission', null, 500));
    }
  },

  // Process admission
  processAdmission: async (req, res) => {
    try {
      const { id } = req.params;
      const { action, comments } = req.body;

      const admission = await Student.findByPk(id);
      if (!admission) {
        return res.status(404).json(new ApiResponse(false, 'Admission not found', null, 404));
      }

      let status;
      if (action === 'approve') {
        status = 'active';
      } else if (action === 'reject') {
        status = 'rejected';
      } else {
        return res.status(400).json(new ApiResponse(false, 'Invalid action', null, 400));
      }

      await admission.update({ status });

      res.status(200).json(new ApiResponse(true, 'Admission processed', null, 200));
    } catch (error) {
      logger.error('Process admission error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to process admission', null, 500));
    }
  },

  // Approve admission
  approveAdmission: async (req, res) => {
    try {
      const { id } = req.params;

      const admission = await Student.findByPk(id);
      if (!admission) {
        return res.status(404).json(new ApiResponse(false, 'Admission not found', null, 404));
      }

      await admission.update({ status: 'active' });

      res.status(200).json(new ApiResponse(true, 'Admission approved', null, 200));
    } catch (error) {
      logger.error('Approve admission error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to approve admission', null, 500));
    }
  },

  // Reject admission
  rejectAdmission: async (req, res) => {
    try {
      const { id } = req.params;

      const admission = await Student.findByPk(id);
      if (!admission) {
        return res.status(404).json(new ApiResponse(false, 'Admission not found', null, 404));
      }

      await admission.update({ status: 'rejected' });

      res.status(200).json(new ApiResponse(true, 'Admission rejected', null, 200));
    } catch (error) {
      logger.error('Reject admission error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to reject admission', null, 500));
    }
  },

  // Get admission summary
  getAdmissionSummary: async (req, res) => {
    try {
      const total = await Student.count();
      const pending = await Student.count({ where: { status: 'pending' } });
      const active = await Student.count({ where: { status: 'active' } });
      const rejected = await Student.count({ where: { status: 'rejected' } });

      const summary = {
        total,
        pending,
        active,
        rejected,
        admissionRate: total > 0 ? ((active / total) * 100).toFixed(2) : 0
      };

      res.status(200).json(new ApiResponse(true, 'Admission summary retrieved', { summary }, 200));
    } catch (error) {
      logger.error('Get admission summary error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get admission summary', null, 500));
    }
  }
};

module.exports = admissionController;