const { Subject, Faculty, User, Timetable, Student, Enrollment } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const teachingController = {
  // Get my subjects
  getMySubjects: async (req, res) => {
    try {
      const userId = req.userId;

      const faculty = await Faculty.findOne({
        where: { userId },
        include: [
          {
            model: Subject,
            as: 'subjects',
            include: [
              {
                model: Course,
                as: 'course'
              }
            ]
          }
        ]
      });

      if (!faculty) {
        return res.status(404).json(new ApiResponse(false, 'Faculty record not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'My subjects retrieved', { subjects: faculty.subjects }, 200));
    } catch (error) {
      logger.error('Get my subjects error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get my subjects', null, 500));
    }
  },

  // Get subject timetable
  getSubjectTimetable: async (req, res) => {
    try {
      const { id } = req.params;

      const timetables = await Timetable.findAll({
        where: { subjectId: id },
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
        ],
        order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
      });

      res.status(200).json(new ApiResponse(true, 'Subject timetable retrieved', { timetables }, 200));
    } catch (error) {
      logger.error('Get subject timetable error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get subject timetable', null, 500));
    }
  },

  // Get subject students
  getSubjectStudents: async (req, res) => {
    try {
      const { id } = req.params;

      const enrollments = await Enrollment.findAll({
        where: { subjectId: id },
        include: [
          {
            model: Student,
            as: 'student',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
              }
            ]
          }
        ]
      });

      const students = enrollments.map(e => e.student);

      res.status(200).json(new ApiResponse(true, 'Subject students retrieved', { students }, 200));
    } catch (error) {
      logger.error('Get subject students error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get subject students', null, 500));
    }
  },

  // Get teaching materials
  getTeachingMaterials: async (req, res) => {
    try {
      const { id } = req.params;

      // In real application, this would fetch materials from a Material model
      const materials = [];

      res.status(200).json(new ApiResponse(true, 'Teaching materials retrieved', { materials }, 200));
    } catch (error) {
      logger.error('Get teaching materials error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get teaching materials', null, 500));
    }
  },

  // Upload material
  uploadMaterial: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, type } = req.body;

      if (!req.file) {
        return res.status(400).json(new ApiResponse(false, 'No file uploaded', null, 400));
      }

      // In real application, this would save to a Material model
      const material = {
        id: Date.now(),
        title,
        description,
        type,
        fileUrl: req.file.path,
        uploadedAt: new Date()
      };

      res.status(201).json(new ApiResponse(true, 'Material uploaded', { material }, 201));
    } catch (error) {
      logger.error('Upload material error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to upload material', null, 500));
    }
  },

  // Delete material
  deleteMaterial: async (req, res) => {
    try {
      const { id, materialId } = req.params;

      // In real application, this would delete from Material model
      res.status(200).json(new ApiResponse(true, 'Material deleted', null, 200));
    } catch (error) {
      logger.error('Delete material error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to delete material', null, 500));
    }
  },

  // Get today's classes
  getTodayClasses: async (req, res) => {
    try {
      const userId = req.userId;
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

      const faculty = await Faculty.findOne({
        where: { userId }
      });

      if (!faculty) {
        return res.status(404).json(new ApiResponse(false, 'Faculty record not found', null, 404));
      }

      const classes = await Timetable.findAll({
        where: {
          facultyId: faculty.id,
          dayOfWeek: today,
          isActive: true
        },
        include: [
          {
            model: Subject,
            as: 'subject'
          }
        ],
        order: [['startTime', 'ASC']]
      });

      res.status(200).json(new ApiResponse(true, 'Today\'s classes retrieved', { classes }, 200));
    } catch (error) {
      logger.error('Get today classes error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get today\'s classes', null, 500));
    }
  },

  // Get week's classes
  getWeekClasses: async (req, res) => {
    try {
      const userId = req.userId;

      const faculty = await Faculty.findOne({
        where: { userId }
      });

      if (!faculty) {
        return res.status(404).json(new ApiResponse(false, 'Faculty record not found', null, 404));
      }

      const classes = await Timetable.findAll({
        where: {
          facultyId: faculty.id,
          isActive: true
        },
        include: [
          {
            model: Subject,
            as: 'subject'
          }
        ],
        order: [
          ['dayOfWeek', 'ASC'],
          ['startTime', 'ASC']
        ]
      });

      // Group by day
      const groupedClasses = {};
      classes.forEach(cls => {
        if (!groupedClasses[cls.dayOfWeek]) {
          groupedClasses[cls.dayOfWeek] = [];
        }
        groupedClasses[cls.dayOfWeek].push(cls);
      });

      res.status(200).json(new ApiResponse(true, 'Week\'s classes retrieved', { classes: groupedClasses }, 200));
    } catch (error) {
      logger.error('Get week classes error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get week\'s classes', null, 500));
    }
  }
};

module.exports = teachingController;