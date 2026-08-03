const { Department, Faculty, User, Course } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const departmentController = {
  // Get all departments
  getDepartments: async (req, res) => {
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
      logger.error('Get departments error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get departments', null, 500));
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
          },
          {
            model: Course,
            as: 'courses'
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

  // Update department budget
  updateBudget: async (req, res) => {
    try {
      const { id } = req.params;
      const { budget } = req.body;

      const department = await Department.findByPk(id);
      if (!department) {
        return res.status(404).json(new ApiResponse(false, 'Department not found', null, 404));
      }

      await department.update({ budget });

      res.status(200).json(new ApiResponse(true, 'Budget updated', { budget }, 200));
    } catch (error) {
      logger.error('Update budget error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update budget', null, 500));
    }
  },

  // Get department faculty
  getDepartmentFaculty: async (req, res) => {
    try {
      const { departmentId } = req.params;

      const faculty = await Faculty.findAll({
        where: { departmentId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Department faculty retrieved', { faculty }, 200));
    } catch (error) {
      logger.error('Get department faculty error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get department faculty', null, 500));
    }
  },

  // Assign faculty to department
  assignFacultyToDepartment: async (req, res) => {
    try {
      const { departmentId } = req.params;
      const { facultyId } = req.body;

      const faculty = await Faculty.findByPk(facultyId);
      if (!faculty) {
        return res.status(404).json(new ApiResponse(false, 'Faculty not found', null, 404));
      }

      await faculty.update({ departmentId });

      res.status(200).json(new ApiResponse(true, 'Faculty assigned to department', null, 200));
    } catch (error) {
      logger.error('Assign faculty error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to assign faculty', null, 500));
    }
  },

  // Get department students
  getDepartmentStudents: async (req, res) => {
    try {
      const { departmentId } = req.params;

      const students = await Student.findAll({
        include: [
          {
            model: Course,
            as: 'course',
            where: { departmentId }
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Department students retrieved', { students }, 200));
    } catch (error) {
      logger.error('Get department students error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get department students', null, 500));
    }
  },

  // Get department courses
  getDepartmentCourses: async (req, res) => {
    try {
      const { departmentId } = req.params;

      const courses = await Course.findAll({
        where: { departmentId }
      });

      res.status(200).json(new ApiResponse(true, 'Department courses retrieved', { courses }, 200));
    } catch (error) {
      logger.error('Get department courses error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get department courses', null, 500));
    }
  }
};

module.exports = departmentController;