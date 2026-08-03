const { Timetable, Subject, Faculty, User } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

const timetableController = {
  // Get current timetable
  getCurrentTimetable: async (req, res) => {
    try {
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const timetables = await Timetable.findAll({
        where: {
          batch: student.batch,
          semester: student.semester
        },
        include: [
          {
            model: Subject,
            as: 'subject'
          },
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
        order: [
          ['dayOfWeek', 'ASC'],
          ['startTime', 'ASC']
        ]
      });

      // Group by day
      const groupedTimetable = {};
      timetables.forEach(t => {
        if (!groupedTimetable[t.dayOfWeek]) {
          groupedTimetable[t.dayOfWeek] = [];
        }
        groupedTimetable[t.dayOfWeek].push(t);
      });

      res.status(200).json(new ApiResponse(true, 'Current timetable retrieved', { timetable: groupedTimetable }, 200));
    } catch (error) {
      logger.error('Get current timetable error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get current timetable', null, 500));
    }
  },

  // Get day timetable
  getDayTimetable: async (req, res) => {
    try {
      const { day } = req.params;
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const timetables = await Timetable.findAll({
        where: {
          batch: student.batch,
          semester: student.semester,
          dayOfWeek: day
        },
        include: [
          {
            model: Subject,
            as: 'subject'
          },
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
        order: [['startTime', 'ASC']]
      });

      res.status(200).json(new ApiResponse(true, 'Day timetable retrieved', { timetable: timetables }, 200));
    } catch (error) {
      logger.error('Get day timetable error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get day timetable', null, 500));
    }
  },

  // Get week timetable
  getWeekTimetable: async (req, res) => {
    try {
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const timetables = await Timetable.findAll({
        where: {
          batch: student.batch,
          semester: student.semester
        },
        include: [
          {
            model: Subject,
            as: 'subject'
          },
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
        order: [
          ['dayOfWeek', 'ASC'],
          ['startTime', 'ASC']
        ]
      });

      // Group by day
      const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const groupedTimetable = {};
      daysOfWeek.forEach(day => {
        groupedTimetable[day] = timetables.filter(t => t.dayOfWeek === day);
      });

      res.status(200).json(new ApiResponse(true, 'Week timetable retrieved', { timetable: groupedTimetable }, 200));
    } catch (error) {
      logger.error('Get week timetable error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get week timetable', null, 500));
    }
  },

  // Get semester timetable
  getSemesterTimetable: async (req, res) => {
    try {
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const timetables = await Timetable.findAll({
        where: {
          batch: student.batch,
          semester: student.semester
        },
        include: [
          {
            model: Subject,
            as: 'subject'
          },
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
        order: [
          ['dayOfWeek', 'ASC'],
          ['startTime', 'ASC']
        ]
      });

      // Group by day
      const groupedTimetable = {};
      timetables.forEach(t => {
        if (!groupedTimetable[t.dayOfWeek]) {
          groupedTimetable[t.dayOfWeek] = [];
        }
        groupedTimetable[t.dayOfWeek].push(t);
      });

      res.status(200).json(new ApiResponse(true, 'Semester timetable retrieved', {
        semester: student.semester,
        batch: student.batch,
        timetable: groupedTimetable
      }, 200));
    } catch (error) {
      logger.error('Get semester timetable error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get semester timetable', null, 500));
    }
  },

  // Export timetable
  exportTimetable: async (req, res) => {
    try {
      const { format = 'pdf' } = req.query;

      // In real application, this would generate and download a file
      res.status(200).json(new ApiResponse(true, 'Timetable exported', { format }, 200));
    } catch (error) {
      logger.error('Export timetable error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to export timetable', null, 500));
    }
  }
};

module.exports = timetableController;