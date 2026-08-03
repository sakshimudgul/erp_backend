const { Result, Student, Subject, Exam } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

const marksController = {
  // Get subject marks
  getSubjectMarks: async (req, res) => {
    try {
      const { subjectId } = req.params;

      const results = await Result.findAll({
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
          },
          {
            model: Exam,
            as: 'exam',
            where: { subjectId }
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Subject marks retrieved', { results }, 200));
    } catch (error) {
      logger.error('Get subject marks error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get subject marks', null, 500));
    }
  },

  // Update marks
  updateMarks: async (req, res) => {
    try {
      const { subjectId, studentId } = req.params;
      const { examId, marksObtained, grade, gradePoints, remarks } = req.body;

      let result = await Result.findOne({
        where: {
          studentId,
          examId
        }
      });

      if (result) {
        await result.update({
          marksObtained,
          grade,
          gradePoints,
          remarks,
          enteredBy: req.userId
        });
      } else {
        result = await Result.create({
          studentId,
          examId,
          marksObtained,
          grade,
          gradePoints,
          remarks,
          enteredBy: req.userId,
          isPublished: false
        });
      }

      res.status(200).json(new ApiResponse(true, 'Marks updated', { result }, 200));
    } catch (error) {
      logger.error('Update marks error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update marks', null, 500));
    }
  },

  // Bulk update marks
  bulkUpdateMarks: async (req, res) => {
    try {
      const { subjectId } = req.params;
      const { examId, marksList } = req.body;

      // marksList is an array of { studentId, marksObtained, grade, gradePoints, remarks }

      const updated = [];
      for (const item of marksList) {
        let result = await Result.findOne({
          where: {
            studentId: item.studentId,
            examId
          }
        });

        if (result) {
          await result.update({
            marksObtained: item.marksObtained,
            grade: item.grade,
            gradePoints: item.gradePoints,
            remarks: item.remarks,
            enteredBy: req.userId
          });
        } else {
          result = await Result.create({
            studentId: item.studentId,
            examId,
            marksObtained: item.marksObtained,
            grade: item.grade,
            gradePoints: item.gradePoints,
            remarks: item.remarks,
            enteredBy: req.userId,
            isPublished: false
          });
        }
        updated.push(result);
      }

      res.status(200).json(new ApiResponse(true, 'Bulk marks updated', { count: updated.length }, 200));
    } catch (error) {
      logger.error('Bulk update marks error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to bulk update marks', null, 500));
    }
  },

  // Get marks report
  getMarksReport: async (req, res) => {
    try {
      const { subjectId } = req.params;

      const results = await Result.findAll({
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
          },
          {
            model: Exam,
            as: 'exam',
            where: { subjectId }
          }
        ]
      });

      // Calculate statistics
      const marks = results.map(r => r.marksObtained).filter(m => m !== null);
      const average = marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;
      const max = marks.length > 0 ? Math.max(...marks) : 0;
      const min = marks.length > 0 ? Math.min(...marks) : 0;

      const report = {
        results,
        statistics: {
          totalStudents: results.length,
          average: average.toFixed(2),
          max,
          min,
          passCount: results.filter(r => r.isPassed).length,
          failCount: results.filter(r => r.isPassed === false).length
        }
      };

      res.status(200).json(new ApiResponse(true, 'Marks report generated', { report }, 200));
    } catch (error) {
      logger.error('Get marks report error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get marks report', null, 500));
    }
  },

  // Get marks statistics
  getMarksStatistics: async (req, res) => {
    try {
      const { subjectId } = req.params;

      const results = await Result.findAll({
        include: [
          {
            model: Exam,
            as: 'exam',
            where: { subjectId }
          }
        ]
      });

      const marks = results.map(r => r.marksObtained).filter(m => m !== null);
      const totalStudents = results.length;
      const passed = results.filter(r => r.isPassed).length;
      const failed = results.filter(r => r.isPassed === false).length;

      // Grade distribution
      const gradeDistribution = {};
      results.forEach(r => {
        if (r.grade) {
          gradeDistribution[r.grade] = (gradeDistribution[r.grade] || 0) + 1;
        }
      });

      const statistics = {
        totalStudents,
        passed,
        failed,
        passRate: totalStudents > 0 ? ((passed / totalStudents) * 100).toFixed(2) : 0,
        averageMarks: marks.length > 0 ? (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(2) : 0,
        highestMarks: marks.length > 0 ? Math.max(...marks) : 0,
        lowestMarks: marks.length > 0 ? Math.min(...marks) : 0,
        gradeDistribution
      };

      res.status(200).json(new ApiResponse(true, 'Marks statistics retrieved', { statistics }, 200));
    } catch (error) {
      logger.error('Get marks statistics error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get marks statistics', null, 500));
    }
  }
};

module.exports = marksController;