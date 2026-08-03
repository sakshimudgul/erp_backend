const { Course, Department, Subject, Student } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const courseController = {
  // Get all courses
  getCourses: async (req, res) => {
    try {
      const { page, limit, offset, filters } = parseQueryParams(req.query);

      const where = {};
      if (filters.departmentId) where.departmentId = filters.departmentId;

      const { count, rows } = await Course.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Department,
            as: 'department'
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Courses retrieved', {
        courses: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }, 200));
    } catch (error) {
      logger.error('Get courses error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get courses', null, 500));
    }
  },

  // Create course
  createCourse: async (req, res) => {
    try {
      const { code, name, description, departmentId, duration, totalSemesters, fees } = req.body;

      // Check if course code exists
      const existingCourse = await Course.findOne({ where: { code } });
      if (existingCourse) {
        return res.status(400).json(new ApiResponse(false, 'Course code already exists', null, 400));
      }

      const course = await Course.create({
        code,
        name,
        description,
        departmentId,
        duration,
        totalSemesters,
        fees
      });

      const createdCourse = await Course.findByPk(course.id, {
        include: [
          {
            model: Department,
            as: 'department'
          }
        ]
      });

      res.status(201).json(new ApiResponse(true, 'Course created', { course: createdCourse }, 201));
    } catch (error) {
      logger.error('Create course error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to create course', null, 500));
    }
  },

  // Get course by ID
  getCourseById: async (req, res) => {
    try {
      const { id } = req.params;

      const course = await Course.findByPk(id, {
        include: [
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

      if (!course) {
        return res.status(404).json(new ApiResponse(false, 'Course not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'Course retrieved', { course }, 200));
    } catch (error) {
      logger.error('Get course by ID error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get course', null, 500));
    }
  },

  // Update course
  updateCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const course = await Course.findByPk(id);
      if (!course) {
        return res.status(404).json(new ApiResponse(false, 'Course not found', null, 404));
      }

      await course.update(updates);

      const updatedCourse = await Course.findByPk(id, {
        include: [
          {
            model: Department,
            as: 'department'
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Course updated', { course: updatedCourse }, 200));
    } catch (error) {
      logger.error('Update course error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update course', null, 500));
    }
  },

  // Delete course
  deleteCourse: async (req, res) => {
    try {
      const { id } = req.params;

      const course = await Course.findByPk(id);
      if (!course) {
        return res.status(404).json(new ApiResponse(false, 'Course not found', null, 404));
      }

      await course.destroy();

      res.status(200).json(new ApiResponse(true, 'Course deleted', null, 200));
    } catch (error) {
      logger.error('Delete course error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to delete course', null, 500));
    }
  },

  // Get course subjects
  getCourseSubjects: async (req, res) => {
    try {
      const { courseId } = req.params;

      const subjects = await Subject.findAll({
        where: { courseId },
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
      });

      res.status(200).json(new ApiResponse(true, 'Course subjects retrieved', { subjects }, 200));
    } catch (error) {
      logger.error('Get course subjects error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get course subjects', null, 500));
    }
  },

  // Add subject to course
  addSubjectToCourse: async (req, res) => {
    try {
      const { courseId, subjectId } = req.params;

      const subject = await Subject.findByPk(subjectId);
      if (!subject) {
        return res.status(404).json(new ApiResponse(false, 'Subject not found', null, 404));
      }

      await subject.update({ courseId });

      res.status(200).json(new ApiResponse(true, 'Subject added to course', null, 200));
    } catch (error) {
      logger.error('Add subject to course error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to add subject to course', null, 500));
    }
  },

  // Remove subject from course
  removeSubjectFromCourse: async (req, res) => {
    try {
      const { courseId, subjectId } = req.params;

      const subject = await Subject.findByPk(subjectId);
      if (!subject) {
        return res.status(404).json(new ApiResponse(false, 'Subject not found', null, 404));
      }

      if (subject.courseId !== courseId) {
        return res.status(400).json(new ApiResponse(false, 'Subject not in this course', null, 400));
      }

      await subject.update({ courseId: null });

      res.status(200).json(new ApiResponse(true, 'Subject removed from course', null, 200));
    } catch (error) {
      logger.error('Remove subject from course error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to remove subject from course', null, 500));
    }
  },

  // Get course students
  getCourseStudents: async (req, res) => {
    try {
      const { courseId } = req.params;

      const students = await Student.findAll({
        where: { courseId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Course students retrieved', { students }, 200));
    } catch (error) {
      logger.error('Get course students error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get course students', null, 500));
    }
  },

  // Get curriculum
  getCurriculum: async (req, res) => {
    try {
      const { courseId } = req.params;

      const subjects = await Subject.findAll({
        where: { courseId },
        order: [['semester', 'ASC']]
      });

      // Group subjects by semester
      const curriculum = {};
      subjects.forEach(subject => {
        const semester = subject.semester;
        if (!curriculum[semester]) {
          curriculum[semester] = [];
        }
        curriculum[semester].push(subject);
      });

      res.status(200).json(new ApiResponse(true, 'Curriculum retrieved', { curriculum }, 200));
    } catch (error) {
      logger.error('Get curriculum error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get curriculum', null, 500));
    }
  },

  // Update curriculum
  updateCurriculum: async (req, res) => {
    try {
      const { courseId } = req.params;
      const { subjects } = req.body;

      // subjects is an array of { subjectId, semester }
      for (const item of subjects) {
        const subject = await Subject.findByPk(item.subjectId);
        if (subject && subject.courseId === courseId) {
          await subject.update({ semester: item.semester });
        }
      }

      res.status(200).json(new ApiResponse(true, 'Curriculum updated', null, 200));
    } catch (error) {
      logger.error('Update curriculum error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update curriculum', null, 500));
    }
  }
};

module.exports = courseController;