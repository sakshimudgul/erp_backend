const { Student, Attendance, Subject } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

const attendanceController = {
  // Get child attendance
  getChildAttendance: async (req, res) => {
    try {
      const { childId } = req.params;

      // In real application, verify parent owns this child
      const attendance = await Attendance.findAll({
        where: { studentId: childId },
        include: [
          {
            model: Subject,
            as: 'subject'
          }
        ],
        order: [['date', 'DESC']]
      });

      res.status(200).json(new ApiResponse(true, 'Child attendance retrieved', { attendance }, 200));
    } catch (error) {
      logger.error('Get child attendance error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get child attendance', null, 500));
    }
  },

  // Get child attendance summary
  getChildAttendanceSummary: async (req, res) => {
    try {
      const { childId } = req.params;

      const attendance = await Attendance.findAll({
        where: { studentId: childId },
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

      Object.keys(summary).forEach(key => {
        const s = summary[key];
        s.percentage = s.total > 0 ? ((s.present / s.total) * 100).toFixed(2) : 0;
      });

      res.status(200).json(new ApiResponse(true, 'Child attendance summary retrieved', { summary }, 200));
    } catch (error) {
      logger.error('Get child attendance summary error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get child attendance summary', null, 500));
    }
  },

  // Get child attendance report
  getChildAttendanceReport: async (req, res) => {
    try {
      const { childId } = req.params;
      const { startDate, endDate } = req.query;

      const attendance = await Attendance.findAll({
        where: {
          studentId: childId,
          date: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
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

      const total = attendance.length;
      const present = attendance.filter(a => a.status === 'present').length;
      const absent = attendance.filter(a => a.status === 'absent').length;
      const late = attendance.filter(a => a.status === 'late').length;
      const excused = attendance.filter(a => a.status === 'excused').length;

      const report = {
        startDate,
        endDate,
        total,
        present,
        absent,
        late,
        excused,
        percentage: total > 0 ? ((present / total) * 100).toFixed(2) : 0,
        details: attendance
      };

      res.status(200).json(new ApiResponse(true, 'Child attendance report generated', { report }, 200));
    } catch (error) {
      logger.error('Get child attendance report error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get child attendance report', null, 500));
    }
  }
};

module.exports = attendanceController;