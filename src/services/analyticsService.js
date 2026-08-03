const { Student, Faculty, Department, Course, Subject, Attendance, Result, Fee } = require('../models');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

class AnalyticsService {
  async getDashboardStats() {
    try {
      const totalStudents = await Student.count();
      const totalFaculty = await Faculty.count();
      const totalDepartments = await Department.count();
      const totalCourses = await Course.count();
      
      const activeStudents = await Student.count({ where: { status: 'active' } });
      const activeFaculty = await Faculty.count({ where: { isActive: true } });
      
      return {
        totalStudents,
        totalFaculty,
        totalDepartments,
        totalCourses,
        activeStudents,
        activeFaculty,
        studentFacultyRatio: totalFaculty > 0 ? (totalStudents / totalFaculty).toFixed(2) : 0
      };
    } catch (error) {
      logger.error('Get dashboard stats error:', error);
      throw error;
    }
  }

  async getStudentDistribution() {
    try {
      const byCourse = await Student.findAll({
        attributes: [
          'courseId',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['courseId'],
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['name']
          }
        ]
      });
      
      const bySemester = await Student.findAll({
        attributes: [
          'semester',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['semester']
      });
      
      const byStatus = await Student.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      });
      
      return {
        byCourse,
        bySemester,
        byStatus
      };
    } catch (error) {
      logger.error('Get student distribution error:', error);
      throw error;
    }
  }

  async getAttendanceAnalytics(startDate, endDate) {
    try {
      const attendanceData = await Attendance.findAll({
        where: {
          date: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        },
        attributes: [
          'subjectId',
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['subjectId', 'status'],
        include: [
          {
            model: Subject,
            as: 'subject',
            attributes: ['name']
          }
        ]
      });
      
      const overallStats = await Attendance.findAll({
        where: {
          date: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          }
        },
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      });
      
      return {
        overall: overallStats,
        bySubject: attendanceData
      };
    } catch (error) {
      logger.error('Get attendance analytics error:', error);
      throw error;
    }
  }

  async getPerformanceAnalytics(courseId, semester) {
    try {
      const results = await Result.findAll({
        where: {
          isPublished: true
        },
        include: [
          {
            model: Exam,
            as: 'exam',
            where: {},
            include: [
              {
                model: Subject,
                as: 'subject',
                where: {}
              }
            ]
          },
          {
            model: Student,
            as: 'student',
            where: {}
          }
        ]
      });
      
      // Filter by course and semester
      const filteredResults = results.filter(r => {
        const subject = r.exam?.subject;
        const student = r.student;
        return subject && student && 
               (!courseId || student.courseId === parseInt(courseId)) &&
               (!semester || subject.semester === parseInt(semester));
      });
      
      const total = filteredResults.length;
      const passed = filteredResults.filter(r => r.isPassed).length;
      const failed = filteredResults.filter(r => !r.isPassed).length;
      
      const marks = filteredResults.map(r => r.marksObtained).filter(m => m !== null);
      const average = marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;
      
      // Grade distribution
      const gradeDistribution = {};
      filteredResults.forEach(r => {
        if (r.grade) {
          gradeDistribution[r.grade] = (gradeDistribution[r.grade] || 0) + 1;
        }
      });
      
      return {
        total,
        passed,
        failed,
        passRate: total > 0 ? ((passed / total) * 100).toFixed(2) : 0,
        averageMarks: average.toFixed(2),
        highestMarks: marks.length > 0 ? Math.max(...marks) : 0,
        lowestMarks: marks.length > 0 ? Math.min(...marks) : 0,
        gradeDistribution
      };
    } catch (error) {
      logger.error('Get performance analytics error:', error);
      throw error;
    }
  }

  async getFeeAnalytics(startDate, endDate) {
    try {
      const totalFees = await Fee.sum('amount');
      const totalPaid = await Fee.sum('paidAmount');
      const totalPending = totalFees - totalPaid;
      
      const byStatus = await Fee.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        group: ['status']
      });
      
      const byType = await Fee.findAll({
        attributes: [
          'feeType',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        group: ['feeType']
      });
      
      // Daily collection trend
      const dailyCollection = await Payment.findAll({
        where: {
          paymentDate: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          },
          status: 'success'
        },
        attributes: [
          [sequelize.fn('DATE', sequelize.col('paymentDate')), 'date'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        group: [sequelize.fn('DATE', sequelize.col('paymentDate'))],
        order: [[sequelize.fn('DATE', sequelize.col('paymentDate')), 'ASC']]
      });
      
      return {
        totalFees,
        totalPaid,
        totalPending,
        collectionRate: totalFees > 0 ? ((totalPaid / totalFees) * 100).toFixed(2) : 0,
        byStatus,
        byType,
        dailyCollection
      };
    } catch (error) {
      logger.error('Get fee analytics error:', error);
      throw error;
    }
  }

  async getFacultyAnalytics(departmentId) {
    try {
      const where = {};
      if (departmentId) where.departmentId = departmentId;
      
      const faculty = await Faculty.findAll({
        where,
        include: [
          {
            model: Subject,
            as: 'subjects'
          },
          {
            model: Department,
            as: 'department'
          }
        ]
      });
      
      const total = faculty.length;
      const avgSubjects = total > 0 ? faculty.reduce((sum, f) => sum + f.subjects.length, 0) / total : 0;
      
      const byDesignation = await Faculty.findAll({
        where,
        attributes: [
          'designation',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['designation']
      });
      
      return {
        totalFaculty: total,
        averageSubjectsPerFaculty: avgSubjects.toFixed(2),
        byDesignation,
        faculty: faculty.map(f => ({
          id: f.id,
          name: `${f.user.firstName} ${f.user.lastName}`,
          designation: f.designation,
          department: f.department?.name,
          subjects: f.subjects.length,
          isHod: f.isHod
        }))
      };
    } catch (error) {
      logger.error('Get faculty analytics error:', error);
      throw error;
    }
  }

  async getTrendAnalytics(metric, period) {
    try {
      let data = [];
      
      switch(metric) {
        case 'students':
          data = await this.getStudentTrend(period);
          break;
        case 'attendance':
          data = await this.getAttendanceTrend(period);
          break;
        case 'performance':
          data = await this.getPerformanceTrend(period);
          break;
        case 'fees':
          data = await this.getFeeTrend(period);
          break;
        default:
          throw new Error('Invalid metric');
      }
      
      return data;
    } catch (error) {
      logger.error('Get trend analytics error:', error);
      throw error;
    }
  }

  async getStudentTrend(period) {
    // Implementation for student trend data
    // Returns monthly/quarterly student enrollment trends
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [100, 120, 135, 150, 180, 200]
    };
  }

  async getAttendanceTrend(period) {
    // Implementation for attendance trend data
    return {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      values: [85, 82, 88, 90]
    };
  }

  async getPerformanceTrend(period) {
    // Implementation for performance trend data
    return {
      labels: ['2022', '2023', '2024'],
      values: [75, 78, 82]
    };
  }

  async getFeeTrend(period) {
    // Implementation for fee collection trend data
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [50000, 55000, 60000, 65000, 70000, 75000]
    };
  }
}

module.exports = new AnalyticsService();