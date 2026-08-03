const { Faculty, User, Department, Subject } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const facultyController = {
  // Get all faculty
  getAllFaculty: async (req, res) => {
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
      logger.error('Get all faculty error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get faculty', null, 500));
    }
  },

  // Create faculty
  createFaculty: async (req, res) => {
    try {
      const {
        userId,
        departmentId,
        employeeId,
        designation,
        qualification,
        specialization,
        experience,
        joiningDate
      } = req.body;

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

  // Activate faculty
  activateFaculty: async (req, res) => {
    try {
      const { id } = req.params;

      const faculty = await Faculty.findByPk(id);
      if (!faculty) {
        return res.status(404).json(new ApiResponse(false, 'Faculty not found', null, 404));
      }

      await faculty.update({ isActive: true });

      res.status(200).json(new ApiResponse(true, 'Faculty activated', null, 200));
    } catch (error) {
      logger.error('Activate faculty error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to activate faculty', null, 500));
    }
  },

  // Deactivate faculty
  deactivateFaculty: async (req, res) => {
    try {
      const { id } = req.params;

      const faculty = await Faculty.findByPk(id);
      if (!faculty) {
        return res.status(404).json(new ApiResponse(false, 'Faculty not found', null, 404));
      }

      await faculty.update({ isActive: false });

      res.status(200).json(new ApiResponse(true, 'Faculty deactivated', null, 200));
    } catch (error) {
      logger.error('Deactivate faculty error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to deactivate faculty', null, 500));
    }
  },

  // Get faculty statistics
  getFacultyStatistics: async (req, res) => {
    try {
      const total = await Faculty.count();
      const byDepartment = await Faculty.findAll({
        attributes: [
          'departmentId',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['departmentId'],
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['name']
          }
        ]
      });

      const byDesignation = await Faculty.findAll({
        attributes: [
          'designation',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['designation']
      });

      const statistics = {
        total,
        byDepartment,
        byDesignation
      };

      res.status(200).json(new ApiResponse(true, 'Faculty statistics retrieved', { statistics }, 200));
    } catch (error) {
      logger.error('Get faculty statistics error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get faculty statistics', null, 500));
    }
  }
};

module.exports = facultyController;