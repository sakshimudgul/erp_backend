const { Student, Result, Exam, Subject } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const resultController = {
  // Get my results
  getMyResults: async (req, res) => {
    try {
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const results = await Result.findAll({
        where: {
          studentId: student.id,
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

      res.status(200).json(new ApiResponse(true, 'Results retrieved', { results }, 200));
    } catch (error) {
      logger.error('Get my results error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get results', null, 500));
    }
  },

  // Get semester results
  getSemesterResults: async (req, res) => {
    try {
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const results = await Result.findAll({
        where: {
          studentId: student.id,
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
      const semesterResults = {};
      results.forEach(result => {
        const semester = result.exam?.subject?.semester;
        if (semester) {
          if (!semesterResults[semester]) {
            semesterResults[semester] = [];
          }
          semesterResults[semester].push(result);
        }
      });

      res.status(200).json(new ApiResponse(true, 'Semester results retrieved', { semesterResults }, 200));
    } catch (error) {
      logger.error('Get semester results error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get semester results', null, 500));
    }
  },

  // Get subject results
  getSubjectResults: async (req, res) => {
    try {
      const { subjectId } = req.params;
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const results = await Result.findAll({
        where: {
          studentId: student.id,
          isPublished: true
        },
        include: [
          {
            model: Exam,
            as: 'exam',
            where: { subjectId },
            include: [
              {
                model: Subject,
                as: 'subject'
              }
            ]
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Subject results retrieved', { results }, 200));
    } catch (error) {
      logger.error('Get subject results error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get subject results', null, 500));
    }
  },

  // Get semester result
  getSemesterResult: async (req, res) => {
    try {
      const { semester } = req.params;
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const results = await Result.findAll({
        where: {
          studentId: student.id,
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

      // Calculate semester statistics
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

      res.status(200).json(new ApiResponse(true, 'Semester result retrieved', { semesterResult }, 200));
    } catch (error) {
      logger.error('Get semester result error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get semester result', null, 500));
    }
  },

  // Get transcript
  getTranscript: async (req, res) => {
    try {
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const results = await Result.findAll({
        where: {
          studentId: student.id,
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
      const transcript = {};
      results.forEach(result => {
        const semester = result.exam?.subject?.semester;
        if (semester) {
          if (!transcript[semester]) {
            transcript[semester] = {
              semester,
              subjects: [],
              totalMarks: 0,
              maxMarks: 0,
              passed: 0,
              failed: 0
            };
          }
          transcript[semester].subjects.push(result);
          transcript[semester].totalMarks += result.marksObtained || 0;
          transcript[semester].maxMarks += result.exam?.maxMarks || 0;
          if (result.isPassed) {
            transcript[semester].passed++;
          } else {
            transcript[semester].failed++;
          }
        }
      });

      // Calculate overall GPA
      const overallStats = {
        totalMarks: 0,
        maxMarks: 0,
        totalPassed: 0,
        totalFailed: 0
      };

      Object.values(transcript).forEach(sem => {
        overallStats.totalMarks += sem.totalMarks;
        overallStats.maxMarks += sem.maxMarks;
        overallStats.totalPassed += sem.passed;
        overallStats.totalFailed += sem.failed;
      });

      res.status(200).json(new ApiResponse(true, 'Transcript retrieved', {
        student,
        transcript,
        overall: {
          ...overallStats,
          percentage: overallStats.maxMarks > 0 ? ((overallStats.totalMarks / overallStats.maxMarks) * 100).toFixed(2) : 0
        }
      }, 200));
    } catch (error) {
      logger.error('Get transcript error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get transcript', null, 500));
    }
  },

  // Get GPA report
  getGPAReport: async (req, res) => {
    try {
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const results = await Result.findAll({
        where: {
          studentId: student.id,
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

      // Calculate GPA
      let totalGradePoints = 0;
      let totalCredits = 0;

      results.forEach(result => {
        const credits = result.exam?.subject?.credits || 0;
        const gradePoints = result.gradePoints || 0;
        totalGradePoints += gradePoints * credits;
        totalCredits += credits;
      });

      const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

      // Calculate CGPA
      const cgpa = gpa; // In real application, this would be cumulative

      const report = {
        student,
        gpa,
        cgpa,
        totalCredits,
        totalGradePoints,
        semesterWise: []
      };

      res.status(200).json(new ApiResponse(true, 'GPA report generated', { report }, 200));
    } catch (error) {
      logger.error('Get GPA report error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get GPA report', null, 500));
    }
  }
};

module.exports = resultController;