const { Student, Course, Subject, Enrollment, Faculty, User } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const academicController = {
  // Get my courses
  getMyCourses: async (req, res) => {
    try {
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId },
        include: [
          {
            model: Course,
            as: 'course'
          }
        ]
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'My courses retrieved', { courses: student.course }, 200));
    } catch (error) {
      logger.error('Get my courses error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get my courses', null, 500));
    }
  },

  // Get my subjects
  getMySubjects: async (req, res) => {
    try {
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const enrollments = await Enrollment.findAll({
        where: { studentId: student.id },
        include: [
          {
            model: Subject,
            as: 'subject',
            include: [
              {
                model: Faculty,
                as: 'faculty',
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

      const subjects = enrollments.map(e => e.subject);

      res.status(200).json(new ApiResponse(true, 'My subjects retrieved', { subjects }, 200));
    } catch (error) {
      logger.error('Get my subjects error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get my subjects', null, 500));
    }
  },

  // Get subject details
  getSubjectDetails: async (req, res) => {
    try {
      const { id } = req.params;

      const subject = await Subject.findByPk(id, {
        include: [
          {
            model: Course,
            as: 'course'
          },
          {
            model: Faculty,
            as: 'faculty',
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

      if (!subject) {
        return res.status(404).json(new ApiResponse(false, 'Subject not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'Subject details retrieved', { subject }, 200));
    } catch (error) {
      logger.error('Get subject details error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get subject details', null, 500));
    }
  },

  // Get academic progress
  getAcademicProgress: async (req, res) => {
    try {
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      // Get completed subjects
      const completedEnrollments = await Enrollment.findAll({
        where: {
          studentId: student.id,
          status: 'completed'
        },
        include: [
          {
            model: Subject,
            as: 'subject'
          }
        ]
      });

      // Get current subjects
      const currentEnrollments = await Enrollment.findAll({
        where: {
          studentId: student.id,
          status: 'enrolled'
        },
        include: [
          {
            model: Subject,
            as: 'subject'
          }
        ]
      });

      const progress = {
        totalSubjects: completedEnrollments.length + currentEnrollments.length,
        completed: completedEnrollments.length,
        inProgress: currentEnrollments.length,
        remaining: 0,
        completionPercentage: 0,
        currentSemester: student.semester
      };

      res.status(200).json(new ApiResponse(true, 'Academic progress retrieved', { progress }, 200));
    } catch (error) {
      logger.error('Get academic progress error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get academic progress', null, 500));
    }
  },

  // Get semester details
  getSemesterDetails: async (req, res) => {
    try {
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const enrollments = await Enrollment.findAll({
        where: {
          studentId: student.id,
          semester: student.semester
        },
        include: [
          {
            model: Subject,
            as: 'subject',
            include: [
              {
                model: Faculty,
                as: 'faculty',
                include: [
                  {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName']
                  }
                ]
              }
            ]
          }
        ]
      });

      const semesterDetails = {
        semester: student.semester,
        batch: student.batch,
        subjects: enrollments.map(e => e.subject),
        totalSubjects: enrollments.length
      };

      res.status(200).json(new ApiResponse(true, 'Semester details retrieved', { semesterDetails }, 200));
    } catch (error) {
      logger.error('Get semester details error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get semester details', null, 500));
    }
  },

  // Get enrollments
  getEnrollments: async (req, res) => {
    try {
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const enrollments = await Enrollment.findAll({
        where: { studentId: student.id },
        include: [
          {
            model: Subject,
            as: 'subject'
          }
        ],
        order: [['semester', 'ASC']]
      });

      res.status(200).json(new ApiResponse(true, 'Enrollments retrieved', { enrollments }, 200));
    } catch (error) {
      logger.error('Get enrollments error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get enrollments', null, 500));
    }
  },

  // Enroll in subject
  enrollInSubject: async (req, res) => {
    try {
      const { subjectId } = req.body;

      const userId = req.userId;
      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        where: {
          studentId: student.id,
          subjectId
        }
      });

      if (existingEnrollment) {
        return res.status(400).json(new ApiResponse(false, 'Already enrolled in this subject', null, 400));
      }

      const enrollment = await Enrollment.create({
        studentId: student.id,
        subjectId,
        semester: student.semester,
        academicYear: new Date().getFullYear().toString(),
        status: 'enrolled'
      });

      res.status(201).json(new ApiResponse(true, 'Enrolled in subject', { enrollment }, 201));
    } catch (error) {
      logger.error('Enroll in subject error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to enroll in subject', null, 500));
    }
  },

  // Drop subject
  dropSubject: async (req, res) => {
    try {
      const { id } = req.params;

      const enrollment = await Enrollment.findByPk(id);
      if (!enrollment) {
        return res.status(404).json(new ApiResponse(false, 'Enrollment not found', null, 404));
      }

      await enrollment.update({ status: 'dropped' });

      res.status(200).json(new ApiResponse(true, 'Subject dropped', null, 200));
    } catch (error) {
      logger.error('Drop subject error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to drop subject', null, 500));
    }
  }
};

module.exports = academicController;