const { Department, User, Faculty } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const departmentController = {
  // Get all departments
  getAllDepartments: async (req, res) => {
    try {
      const { page, limit, offset } = parseQueryParams(req.query);

      const { count, rows } = await Department.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'head',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Departments retrieved', {
        departments: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }, 200));
    } catch (error) {
      logger.error('Get all departments error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get departments', null, 500));
    }
  },

  // Create department
  createDepartment: async (req, res) => {
    try {
      const { code, name, description, establishedYear } = req.body;

      const existingDepartment = await Department.findOne({ where: { code } });
      if (existingDepartment) {
        return res.status(400).json(new ApiResponse(false, 'Department code already exists', null, 400));
      }

      const department = await Department.create({
        code,
        name,
        description,
        establishedYear
      });

      res.status(201).json(new ApiResponse(true, 'Department created', { department }, 201));
    } catch (error) {
      logger.error('Create department error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to create department', null, 500));
    }
  },

  // Get department by ID
  getDepartmentById: async (req, res) => {
    try {
      const { id } = req.params;

      const department = await Department.findByPk(id, {
        include: [
          {
            model: User,
            as: 'head',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: Faculty,
            as: 'faculties',
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

      if (!department) {
        return res.status(404).json(new ApiResponse(false, 'Department not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'Department retrieved', { department }, 200));
    } catch (error) {
      logger.error('Get department by ID error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get department', null, 500));
    }
  },

  // Update department
  updateDepartment: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const department = await Department.findByPk(id);
      if (!department) {
        return res.status(404).json(new ApiResponse(false, 'Department not found', null, 404));
      }

      await department.update(updates);

      const updatedDepartment = await Department.findByPk(id, {
        include: [
          {
            model: User,
            as: 'head',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Department updated', { department: updatedDepartment }, 200));
    } catch (error) {
      logger.error('Update department error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update department', null, 500));
    }
  },

  // Delete department
  deleteDepartment: async (req, res) => {
    try {
      const { id } = req.params;

      const department = await Department.findByPk(id);
      if (!department) {
        return res.status(404).json(new ApiResponse(false, 'Department not found', null, 404));
      }

      await department.destroy();

      res.status(200).json(new ApiResponse(true, 'Department deleted', null, 200));
    } catch (error) {
      logger.error('Delete department error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to delete department', null, 500));
    }
  },

  // Assign department head
  assignHead: async (req, res) => {
    try {
      const { id } = req.params;
      const { facultyId } = req.body;

      const department = await Department.findByPk(id);
      if (!department) {
        return res.status(404).json(new ApiResponse(false, 'Department not found', null, 404));
      }

      const faculty = await Faculty.findByPk(facultyId);
      if (!faculty) {
        return res.status(404).json(new ApiResponse(false, 'Faculty not found', null, 404));
      }

      await department.update({ headId: faculty.userId });
      await faculty.update({ isHod: true });

      res.status(200).json(new ApiResponse(true, 'Department head assigned', null, 200));
    } catch (error) {
      logger.error('Assign head error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to assign head', null, 500));
    }
  },

  // Remove department head
  removeHead: async (req, res) => {
    try {
      const { id } = req.params;

      const department = await Department.findByPk(id);
      if (!department) {
        return res.status(404).json(new ApiResponse(false, 'Department not found', null, 404));
      }

      await Faculty.update(
        { isHod: false },
        { where: { userId: department.headId } }
      );

      await department.update({ headId: null });

      res.status(200).json(new ApiResponse(true, 'Department head removed', null, 200));
    } catch (error) {
      logger.error('Remove head error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to remove head', null, 500));
    }
  },

  // Get department budget
  getDepartmentBudget: async (req, res) => {
    try {
      const { id } = req.params;

      const department = await Department.findByPk(id, {
        attributes: ['id', 'name', 'budget']
      });

      if (!department) {
        return res.status(404).json(new ApiResponse(false, 'Department not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'Department budget retrieved', { budget: department.budget }, 200));
    } catch (error) {
      logger.error('Get department budget error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get department budget', null, 500));
    }
  },

  // Update department budget
  updateDepartmentBudget: async (req, res) => {
    try {
      const { id } = req.params;
      const { budget } = req.body;

      const department = await Department.findByPk(id);
      if (!department) {
        return res.status(404).json(new ApiResponse(false, 'Department not found', null, 404));
      }

      await department.update({ budget });

      res.status(200).json(new ApiResponse(true, 'Department budget updated', { budget }, 200));
    } catch (error) {
      logger.error('Update department budget error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update department budget', null, 500));
    }
  }
};

module.exports = departmentController;