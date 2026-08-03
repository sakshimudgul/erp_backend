const { Student, User, Parent, Course, Department } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

const childController = {
  // Get my children
  getMyChildren: async (req, res) => {
    try {
      const userId = req.userId;

      const parent = await Parent.findOne({
        where: { userId }
      });

      if (!parent) {
        return res.status(404).json(new ApiResponse(false, 'Parent record not found', null, 404));
      }

      // In real application, there would be a StudentParent model linking students to parents
      // For now, returning placeholder
      const children = [];

      res.status(200).json(new ApiResponse(true, 'Children retrieved', { children }, 200));
    } catch (error) {
      logger.error('Get my children error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get children', null, 500));
    }
  },

  // Get child details
  getChildDetails: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      // In real application, verify parent owns this child
      const student = await Student.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profileImage']
          },
          {
            model: Course,
            as: 'course',
            include: [
              {
                model: Department,
                as: 'department'
              }
            ]
          }
        ]
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'Child details retrieved', { child: student }, 200));
    } catch (error) {
      logger.error('Get child details error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get child details', null, 500));
    }
  },

  // Get child academic info
  getChildAcademicInfo: async (req, res) => {
    try {
      const { id } = req.params;

      // In real application, this would fetch academic information
      const academicInfo = {
        studentId: id,
        currentSemester: 1,
        batch: '2024-2028',
        course: 'B.Tech',
        subjects: []
      };

      res.status(200).json(new ApiResponse(true, 'Child academic info retrieved', { academicInfo }, 200));
    } catch (error) {
      logger.error('Get child academic info error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get child academic info', null, 500));
    }
  },

  // Get child subjects
  getChildSubjects: async (req, res) => {
    try {
      const { id } = req.params;

      // In real application, this would fetch subjects from enrollments
      const subjects = [];

      res.status(200).json(new ApiResponse(true, 'Child subjects retrieved', { subjects }, 200));
    } catch (error) {
      logger.error('Get child subjects error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get child subjects', null, 500));
    }
  },

  // Get child profile
  getChildProfile: async (req, res) => {
    try {
      const { id } = req.params;

      const student = await Student.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profileImage']
          }
        ]
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'Child profile retrieved', { profile: student }, 200));
    } catch (error) {
      logger.error('Get child profile error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get child profile', null, 500));
    }
  }
};

module.exports = childController;