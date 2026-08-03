const { Student, User, Course } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const studentController = {
  // Get students
  getStudents: async (req, res) => {
    try {
      const { page, limit, offset, filters } = parseQueryParams(req.query);

      const where = {};
      if (filters.courseId) where.courseId = filters.courseId;
      if (filters.batch) where.batch = filters.batch;

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
      logger.error('Get students error:', error);
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
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          },
          {
            model: Course,
            as: 'course'
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

  // Upload student documents
  uploadStudentDocuments: async (req, res) => {
    try {
      const { id } = req.params;
      const { documents } = req.body;

      // In real application, this would save to Document model
      res.status(200).json(new ApiResponse(true, 'Documents uploaded', null, 200));
    } catch (error) {
      logger.error('Upload student documents error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to upload documents', null, 500));
    }
  },

  // Get student documents
  getStudentDocuments: async (req, res) => {
    try {
      const { id } = req.params;

      // In real application, this would fetch from Document model
      const documents = [];

      res.status(200).json(new ApiResponse(true, 'Student documents retrieved', { documents }, 200));
    } catch (error) {
      logger.error('Get student documents error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get student documents', null, 500));
    }
  },

  // Generate ID card
  generateIdCard: async (req, res) => {
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
            as: 'course'
          }
        ]
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student not found', null, 404));
      }

      // In real application, this would generate an ID card PDF
      const idCard = {
        student,
        issueDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'active'
      };

      res.status(200).json(new ApiResponse(true, 'ID card generated', { idCard }, 200));
    } catch (error) {
      logger.error('Generate ID card error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to generate ID card', null, 500));
    }
  }
};

module.exports = studentController;