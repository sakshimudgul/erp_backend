const { Student, Attendance, Subject } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const attendanceController = {
  // Get my attendance
  getMyAttendance: async (req, res) => {
    try {
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const attendance = await Attendance.findAll({
        where: { studentId: student.id },
        include: [
          {
            model: Subject,
            as: 'subject'
          }
        ],
        order: [['date', 'DESC']]
      });

      res.status(200).json(new ApiResponse(true, 'Attendance retrieved', { attendance }, 200));
    } catch (error) {
      logger.error('Get my attendance error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get attendance', null, 500));
    }
  },

  // Get subject attendance
  getSubjectAttendance: async (req, res) => {
    try {
      const { subjectId } = req.params;
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const attendance = await Attendance.findAll({
        where: {
          studentId: student.id,
          subjectId
        },
        order: [['date', 'DESC']]
      });

      // Calculate statistics
      const total = attendance.length;
      const present = attendance.filter(a => a.status === 'present').length;
      const absent = attendance.filter(a => a.status === 'absent').length;
      const late = attendance.filter(a => a.status === 'late').length;
      const excused = attendance.filter(a => a.status === 'excused').length;

      const statistics = {
        total,
        present,
        absent,
        late,
        excused,
        percentage: total > 0 ? ((present / total) * 100).toFixed(2) : 0
      };

      res.status(200).json(new ApiResponse(true, 'Subject attendance retrieved', {
        attendance,
        statistics
      }, 200));
    } catch (error) {
      logger.error('Get subject attendance error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get subject attendance', null, 500));
    }
  },

  // Get attendance summary
  getAttendanceSummary: async (req, res) => {
    try {
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const attendance = await Attendance.findAll({
        where: { studentId: student.id },
        include: [
          {
            model: Subject,
            as: 'subject'
          }
        ]
      });

      // Group by subject
      const summary = {};
      attendance.forEach(a => {
        const subjectId = a.subjectId;
        if (!summary[subjectId]) {
          summary[subjectId] = {
            subjectName: a.subject.name,
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0
          };
        }
        summary[subjectId].total++;
        summary[subjectId][a.status] = (summary[subjectId][a.status] || 0) + 1;
      });

      // Calculate percentages
      Object.keys(summary).forEach(key => {
        const s = summary[key];
        s.percentage = s.total > 0 ? ((s.present / s.total) * 100).toFixed(2) : 0;
      });

      res.status(200).json(new ApiResponse(true, 'Attendance summary retrieved', { summary }, 200));
    } catch (error) {
      logger.error('Get attendance summary error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get attendance summary', null, 500));
    }
  },

  // Get monthly attendance
  getMonthlyAttendance: async (req, res) => {
    try {
      const { month, year } = req.query;
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const attendance = await Attendance.findAll({
        where: {
          studentId: student.id,
          date: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: [
          {
            model: Subject,
            as: 'subject'
          }
        ],
        order: [['date', 'ASC']]
      });

      // Group by date
      const daily = {};
      attendance.forEach(a => {
        const dateKey = a.date;
        if (!daily[dateKey]) {
          daily[dateKey] = {
            date: a.date,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            total: 0
          };
        }
        daily[dateKey].total++;
        daily[dateKey][a.status] = (daily[dateKey][a.status] || 0) + 1;
      });

      const monthlyData = {
        month,
        year,
        daily: Object.values(daily),
        totalPresent: attendance.filter(a => a.status === 'present').length,
        totalAbsent: attendance.filter(a => a.status === 'absent').length,
        totalLate: attendance.filter(a => a.status === 'late').length,
        totalExcused: attendance.filter(a => a.status === 'excused').length
      };

      res.status(200).json(new ApiResponse(true, 'Monthly attendance retrieved', { monthlyData }, 200));
    } catch (error) {
      logger.error('Get monthly attendance error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get monthly attendance', null, 500));
    }
  },

  // Get semester attendance
  getSemesterAttendance: async (req, res) => {
    try {
      const { semester } = req.query;
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      // This would need semester dates from academic calendar
      // For now, returning placeholder
      const semesterData = {
        semester: semester || student.semester,
        overallPercentage: 0,
        subjectWise: []
      };

      res.status(200).json(new ApiResponse(true, 'Semester attendance retrieved', { semesterData }, 200));
    } catch (error) {
      logger.error('Get semester attendance error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get semester attendance', null, 500));
    }
  }
};

module.exports = attendanceController;