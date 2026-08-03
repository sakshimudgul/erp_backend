const { Student, Result, Exam, Subject } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

const resultController = {
  // Get child results
  getChildResults: async (req, res) => {
    try {
      const { childId } = req.params;

      const results = await Result.findAll({
        where: {
          studentId: childId,
          isPublished: true
        },
        include: [
          {
            model: Exam,
            as: 'exam',
            include: [
              {
                model: Subject,
                as: 'subject'
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json(new ApiResponse(true, 'Child results retrieved', { results }, 200));
    } catch (error) {
      logger.error('Get child results error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get child results', null, 500));
    }
  },

  // Get child semester result
  getChildSemesterResult: async (req, res) => {
    try {
      const { childId, semester } = req.params;

      const results = await Result.findAll({
        where: {
          studentId: childId,
          isPublished: true
        },
        include: [
          {
            model: Exam,
            as: 'exam',
            include: [
              {
                model: Subject,
                as: 'subject',
                where: { semester }
              }
            ]
          }
        ]
      });

      const totalMarks = results.reduce((sum, r) => sum + (r.marksObtained || 0), 0);
      const maxMarks = results.reduce((sum, r) => sum + (r.exam?.maxMarks || 0), 0);
      const passed = results.filter(r => r.isPassed).length;
      const failed = results.filter(r => !r.isPassed).length;

      const semesterResult = {
        semester,
        results,
        statistics: {
          totalMarks,
          maxMarks,
          percentage: maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(2) : 0,
          passed,
          failed,
          totalSubjects: results.length
        }
      };

      res.status(200).json(new ApiResponse(true, 'Child semester result retrieved', { semesterResult }, 200));
    } catch (error) {
      logger.error('Get child semester result error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get child semester result', null, 500));
    }
  },

  // Get child result report
  getChildResultReport: async (req, res) => {
    try {
      const { childId } = req.params;

      const results = await Result.findAll({
        where: {
          studentId: childId,
          isPublished: true
        },
        include: [
          {
            model: Exam,
            as: 'exam',
            include: [
              {
                model: Subject,
                as: 'subject'
              }
            ]
          }
        ]
      });

      // Group by semester
      const report = {};
      results.forEach(result => {
        const semester = result.exam?.subject?.semester;
        if (semester) {
          if (!report[semester]) {
            report[semester] = {
              semester,
              subjects: [],
              totalMarks: 0,
              maxMarks: 0,
              passed: 0,
              failed: 0
            };
          }
          report[semester].subjects.push(result);
          report[semester].totalMarks += result.marksObtained || 0;
          report[semester].maxMarks += result.exam?.maxMarks || 0;
          if (result.isPassed) {
            report[semester].passed++;
          } else {
            report[semester].failed++;
          }
        }
      });

      res.status(200).json(new ApiResponse(true, 'Child result report generated', { report }, 200));
    } catch (error) {
      logger.error('Get child result report error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get child result report', null, 500));
    }
  }
};

module.exports = resultController;