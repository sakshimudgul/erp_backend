const { Student, User, Course, Department } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const studentController = {
  // Get all students
  getAllStudents: async (req, res) => {
    try {
      const { page, limit, offset, filters } = parseQueryParams(req.query);

      const where = {};
      if (filters.courseId) where.courseId = filters.courseId;
      if (filters.batch) where.batch = filters.batch;
      if (filters.semester) where.semester = filters.semester;
      if (filters.status) where.status = filters.status;

      const { count, rows } = await Student.findAndCountAll({
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

      res.status(200).json(new ApiResponse(true, 'Students retrieved', {
        students: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }, 200));
    } catch (error) {
      logger.error('Get all students error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get students', null, 500));
    }
  },

  // Create student
  createStudent: async (req, res) => {
    try {
      const {
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
        guardianPhone
      } = req.body;

      const existingStudent = await Student.findOne({ where: { enrollmentNumber } });
      if (existingStudent) {
        return res.status(400).json(new ApiResponse(false, 'Enrollment number already exists', null, 400));
      }

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
        status: 'active'
      });

      const createdStudent = await Student.findByPk(student.id, {
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

      res.status(201).json(new ApiResponse(true, 'Student created', { student: createdStudent }, 201));
    } catch (error) {
      logger.error('Create student error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to create student', null, 500));
    }
  },

  // Get student by ID
  getStudentById: async (req, res) => {
    try {
      const { id } = req.params;

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

      res.status(200).json(new ApiResponse(true, 'Student retrieved', { student }, 200));
    } catch (error) {
      logger.error('Get student by ID error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get student', null, 500));
    }
  },

  // Update student
  updateStudent: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const student = await Student.findByPk(id);
      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student not found', null, 404));
      }

      await student.update(updates);

      const updatedStudent = await Student.findByPk(id, {
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

      res.status(200).json(new ApiResponse(true, 'Student updated', { student: updatedStudent }, 200));
    } catch (error) {
      logger.error('Update student error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update student', null, 500));
    }
  },

  // Delete student
  deleteStudent: async (req, res) => {
    try {
      const { id } = req.params;

      const student = await Student.findByPk(id);
      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student not found', null, 404));
      }

      await student.destroy();

      res.status(200).json(new ApiResponse(true, 'Student deleted', null, 200));
    } catch (error) {
      logger.error('Delete student error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to delete student', null, 500));
    }
  },

  // Activate student
  activateStudent: async (req, res) => {
    try {
      const { id } = req.params;

      const student = await Student.findByPk(id);
      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student not found', null, 404));
      }

      await student.update({ status: 'active' });

      res.status(200).json(new ApiResponse(true, 'Student activated', null, 200));
    } catch (error) {
      logger.error('Activate student error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to activate student', null, 500));
    }
  },

  // Suspend student
  suspendStudent: async (req, res) => {
    try {
      const { id } = req.params;

      const student = await Student.findByPk(id);
      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student not found', null, 404));
      }

      await student.update({ status: 'suspended' });

      res.status(200).json(new ApiResponse(true, 'Student suspended', null, 200));
    } catch (error) {
      logger.error('Suspend student error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to suspend student', null, 500));
    }
  },

  // Graduate student
  graduateStudent: async (req, res) => {
    try {
      const { id } = req.params;

      const student = await Student.findByPk(id);
      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student not found', null, 404));
      }

      await student.update({ status: 'graduated' });

      res.status(200).json(new ApiResponse(true, 'Student graduated', null, 200));
    } catch (error) {
      logger.error('Graduate student error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to graduate student', null, 500));
    }
  },

  // Get student statistics
  getStudentStatistics: async (req, res) => {
    try {
      const total = await Student.count();
      const active = await Student.count({ where: { status: 'active' } });
      const suspended = await Student.count({ where: { status: 'suspended' } });
      const graduated = await Student.count({ where: { status: 'graduated' } });

      const statistics = {
        total,
        active,
        suspended,
        graduated,
        statusDistribution: {
          active: ((active / total) * 100).toFixed(2),
          suspended: ((suspended / total) * 100).toFixed(2),
          graduated: ((graduated / total) * 100).toFixed(2)
        }
      };

      res.status(200).json(new ApiResponse(true, 'Student statistics retrieved', { statistics }, 200));
    } catch (error) {
      logger.error('Get student statistics error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get student statistics', null, 500));
    }
  }
};

module.exports = studentController;