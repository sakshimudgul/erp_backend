const { Attendance, Student, Subject, Enrollment } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const attendanceController = {
  // Get subject attendance
  getSubjectAttendance: async (req, res) => {
    try {
      const { subjectId } = req.params;
      const { startDate, endDate } = req.query;

      const where = { subjectId };
      if (startDate && endDate) {
        where.date = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const attendance = await Attendance.findAll({
        where,
        include: [
          {
            model: Student,
            as: 'student',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
              }
            ]
          }
        ],
        order: [['date', 'DESC']]
      });

      res.status(200).json(new ApiResponse(true, 'Subject attendance retrieved', { attendance }, 200));
    } catch (error) {
      logger.error('Get subject attendance error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get subject attendance', null, 500));
    }
  },

  // Mark attendance
  markAttendance: async (req, res) => {
    try {
      const { subjectId } = req.params;
      const { studentId, status, date, checkInTime, checkOutTime, remarks } = req.body;

      // Check if attendance already exists for this student on this date
      const existingAttendance = await Attendance.findOne({
        where: {
          studentId,
          subjectId,
          date
        }
      });

      if (existingAttendance) {
        return res.status(400).json(new ApiResponse(false, 'Attendance already marked for this date', null, 400));
      }

      const attendance = await Attendance.create({
        studentId,
        subjectId,
        date,
        status,
        checkInTime,
        checkOutTime,
        remarks,
        markedBy: req.userId
      });

      res.status(201).json(new ApiResponse(true, 'Attendance marked', { attendance }, 201));
    } catch (error) {
      logger.error('Mark attendance error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to mark attendance', null, 500));
    }
  },

  // Update attendance
  updateAttendance: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const attendance = await Attendance.findByPk(id);
      if (!attendance) {
        return res.status(404).json(new ApiResponse(false, 'Attendance record not found', null, 404));
      }

      await attendance.update(updates);

      res.status(200).json(new ApiResponse(true, 'Attendance updated', { attendance }, 200));
    } catch (error) {
      logger.error('Update attendance error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update attendance', null, 500));
    }
  },

  // Get attendance report
  getAttendanceReport: async (req, res) => {
    try {
      const { subjectId } = req.params;
      const { startDate, endDate } = req.query;

      // Get all students enrolled in this subject
      const enrollments = await Enrollment.findAll({
        where: { subjectId },
        include: [
          {
            model: Student,
            as: 'student',
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

      // Get attendance records
      const attendanceRecords = await Attendance.findAll({
        where: {
          subjectId,
          date: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        }
      });

      // Calculate attendance percentage for each student
      const report = enrollments.map(enrollment => {
        const student = enrollment.student;
        const studentAttendance = attendanceRecords.filter(a => a.studentId === student.id);
        const totalClasses = studentAttendance.length;
        const presentClasses = studentAttendance.filter(a => a.status === 'present').length;
        const percentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 0;

        return {
          studentId: student.id,
          studentName: `${student.user.firstName} ${student.user.lastName}`,
          enrollmentNumber: student.enrollmentNumber,
          totalClasses,
          presentClasses,
          absentClasses: totalClasses - presentClasses,
          percentage
        };
      });

      res.status(200).json(new ApiResponse(true, 'Attendance report generated', { report }, 200));
    } catch (error) {
      logger.error('Get attendance report error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get attendance report', null, 500));
    }
  },

  // Bulk mark attendance
  bulkMarkAttendance: async (req, res) => {
    try {
      const { subjectId } = req.params;
      const { date, attendanceList } = req.body;

      // attendanceList is an array of { studentId, status, checkInTime, checkOutTime, remarks }

      const created = [];
      for (const item of attendanceList) {
        const existing = await Attendance.findOne({
          where: {
            studentId: item.studentId,
            subjectId,
            date
          }
        });

        if (!existing) {
          const attendance = await Attendance.create({
            studentId: item.studentId,
            subjectId,
            date,
            status: item.status,
            checkInTime: item.checkInTime,
            checkOutTime: item.checkOutTime,
            remarks: item.remarks,
            markedBy: req.userId
          });
          created.push(attendance);
        }
      }

      res.status(201).json(new ApiResponse(true, 'Bulk attendance marked', { count: created.length }, 201));
    } catch (error) {
      logger.error('Bulk mark attendance error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to mark bulk attendance', null, 500));
    }
  },

  // Get attendance statistics
  getAttendanceStatistics: async (req, res) => {
    try {
      const { subjectId } = req.params;

      const totalStudents = await Enrollment.count({ where: { subjectId } });
      const totalDays = await Attendance.count({
        where: { subjectId },
        distinct: ['date']
      });
      const totalPresent = await Attendance.count({
        where: { subjectId, status: 'present' }
      });
      const totalAbsent = await Attendance.count({
        where: { subjectId, status: 'absent' }
      });
      const totalLate = await Attendance.count({
        where: { subjectId, status: 'late' }
      });
      const totalExcused = await Attendance.count({
        where: { subjectId, status: 'excused' }
      });

      const statistics = {
        totalStudents,
        totalDays,
        totalPresent,
        totalAbsent,
        totalLate,
        totalExcused,
        averageAttendance: totalDays > 0 ? ((totalPresent / (totalStudents * totalDays)) * 100).toFixed(2) : 0
      };

      res.status(200).json(new ApiResponse(true, 'Attendance statistics retrieved', { statistics }, 200));
    } catch (error) {
      logger.error('Get attendance statistics error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get attendance statistics', null, 500));
    }
  }
};

module.exports = attendanceController;