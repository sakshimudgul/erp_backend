const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Student, Faculty, Department, Course, Subject, Attendance, Result, Fee } = require('../models');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class ReportService {
  constructor() {
    this.reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async generateAttendanceReport(data) {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `attendance-report-${Date.now()}.pdf`;
      const filepath = path.join(this.reportsDir, filename);
      
      doc.pipe(fs.createWriteStream(filepath));
      
      // Header
      doc.fontSize(20).text('Attendance Report', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`);
      doc.text(`Department: ${data.department || 'All'}`);
      doc.text(`Semester: ${data.semester || 'All'}`);
      doc.moveDown();
      
      // Table headers
      const headers = ['Student Name', 'Enrollment', 'Total Classes', 'Present', 'Absent', 'Percentage'];
      let y = doc.y;
      const startX = 50;
      const columnWidths = [80, 80, 60, 60, 60, 70];
      
      doc.fontSize(10).font('Helvetica-Bold');
      headers.forEach((header, i) => {
        const x = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.text(header, x, y, { width: columnWidths[i], align: 'center' });
      });
      
      doc.font('Helvetica');
      y += 20;
      
      // Table rows
      data.students.forEach(student => {
        const x = startX;
        doc.text(student.name, x, y, { width: columnWidths[0] });
        doc.text(student.enrollment, x + columnWidths[0], y, { width: columnWidths[1] });
        doc.text(student.total, x + columnWidths[0] + columnWidths[1], y, { width: columnWidths[2] });
        doc.text(student.present, x + columnWidths[0] + columnWidths[1] + columnWidths[2], y, { width: columnWidths[3] });
        doc.text(student.absent, x + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], y, { width: columnWidths[4] });
        doc.text(`${student.percentage}%`, x + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + columnWidths[4], y, { width: columnWidths[5] });
        y += 20;
        
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
      });
      
      doc.end();
      return filepath;
    } catch (error) {
      logger.error('Generate attendance report error:', error);
      throw error;
    }
  }

  async generatePerformanceReport(data) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Performance Report');
      
      // Style headers
      worksheet.columns = [
        { header: 'Student Name', key: 'name', width: 20 },
        { header: 'Enrollment', key: 'enrollment', width: 15 },
        { header: 'Course', key: 'course', width: 20 },
        { header: 'Semester', key: 'semester', width: 10 },
        { header: 'Total Marks', key: 'totalMarks', width: 12 },
        { header: 'Obtained Marks', key: 'obtainedMarks', width: 15 },
        { header: 'Percentage', key: 'percentage', width: 12 },
        { header: 'Grade', key: 'grade', width: 10 },
        { header: 'Status', key: 'status', width: 12 }
      ];
      
      // Add data
      data.results.forEach(result => {
        worksheet.addRow({
          name: result.studentName,
          enrollment: result.enrollment,
          course: result.course,
          semester: result.semester,
          totalMarks: result.totalMarks,
          obtainedMarks: result.obtainedMarks,
          percentage: result.percentage,
          grade: result.grade,
          status: result.status
        });
      });
      
      // Add summary section
      worksheet.addRow([]);
      worksheet.addRow(['Summary']);
      worksheet.addRow(['Total Students:', data.results.length]);
      worksheet.addRow(['Passed:', data.passed]);
      worksheet.addRow(['Failed:', data.failed]);
      worksheet.addRow(['Pass Percentage:', data.passPercentage]);
      
      const filename = `performance-report-${Date.now()}.xlsx`;
      const filepath = path.join(this.reportsDir, filename);
      
      await workbook.xlsx.writeFile(filepath);
      return filepath;
    } catch (error) {
      logger.error('Generate performance report error:', error);
      throw error;
    }
  }

  async generateFeeReport(data) {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `fee-report-${Date.now()}.pdf`;
      const filepath = path.join(this.reportsDir, filename);
      
      doc.pipe(fs.createWriteStream(filepath));
      
      // Header
      doc.fontSize(20).text('Fee Collection Report', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(12).text(`Period: ${data.startDate} to ${data.endDate}`);
      doc.text(`Total Collected: ₹${data.totalCollected}`);
      doc.text(`Total Pending: ₹${data.totalPending}`);
      doc.text(`Collection Rate: ${data.collectionRate}%`);
      doc.moveDown();
      
      // Fee breakdown
      doc.fontSize(14).text('Fee Breakdown', { underline: true });
      doc.moveDown();
      
      data.feeBreakdown.forEach(item => {
        doc.fontSize(10).text(`${item.type}: ₹${item.amount} (${item.percentage}%)`);
      });
      
      doc.end();
      return filepath;
    } catch (error) {
      logger.error('Generate fee report error:', error);
      throw error;
    }
  }

  async generateStudentReport(data) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Student Report');
      
      // Style headers
      worksheet.columns = [
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Enrollment', key: 'enrollment', width: 15 },
        { header: 'Course', key: 'course', width: 20 },
        { header: 'Batch', key: 'batch', width: 10 },
        { header: 'Semester', key: 'semester', width: 10 },
        { header: 'Status', key: 'status', width: 12 }
      ];
      
      data.students.forEach(student => {
        worksheet.addRow({
          name: student.name,
          email: student.email,
          enrollment: student.enrollment,
          course: student.course,
          batch: student.batch,
          semester: student.semester,
          status: student.status
        });
      });
      
      const filename = `student-report-${Date.now()}.xlsx`;
      const filepath = path.join(this.reportsDir, filename);
      
      await workbook.xlsx.writeFile(filepath);
      return filepath;
    } catch (error) {
      logger.error('Generate student report error:', error);
      throw error;
    }
  }

  async generateFacultyReport(data) {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `faculty-report-${Date.now()}.pdf`;
      const filepath = path.join(this.reportsDir, filename);
      
      doc.pipe(fs.createWriteStream(filepath));
      
      // Header
      doc.fontSize(20).text('Faculty Report', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(12).text(`Department: ${data.department || 'All'}`);
      doc.text(`Total Faculty: ${data.totalFaculty}`);
      doc.moveDown();
      
      // Faculty details
      data.faculty.forEach(faculty => {
        doc.fontSize(12).text(`Name: ${faculty.name}`);
        doc.text(`Designation: ${faculty.designation}`);
        doc.text(`Qualification: ${faculty.qualification}`);
        doc.text(`Subjects: ${faculty.subjects.join(', ')}`);
        doc.text(`Workload: ${faculty.workload} hours/week`);
        doc.moveDown();
      });
      
      doc.end();
      return filepath;
    } catch (error) {
      logger.error('Generate faculty report error:', error);
      throw error;
    }
  }

  async deleteReport(filepath) {
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Delete report error:', error);
      return false;
    }
  }
}

module.exports = new ReportService();