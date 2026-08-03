const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      logger.info('Email transporter initialized');
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
    }
  }

  async sendEmail(to, subject, html, attachments = []) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@college.com',
        to,
        subject,
        html,
        attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    const subject = 'Welcome to College Management System';
    const html = `
      <h1>Welcome ${user.firstName}!</h1>
      <p>Your account has been created successfully.</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Role:</strong> ${user.role}</p>
      <p>Please login to access your dashboard.</p>
      <a href="${process.env.FRONTEND_URL}/login">Login Here</a>
    `;
    return this.sendEmail(user.email, subject, html);
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const html = `
      <h1>Password Reset</h1>
      <p>You requested to reset your password.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    return this.sendEmail(user.email, subject, html);
  }

  async sendFeeReminderEmail(student, fee) {
    const subject = 'Fee Payment Reminder';
    const html = `
      <h1>Fee Payment Reminder</h1>
      <p>Dear ${student.user.firstName},</p>
      <p>This is a reminder that your fee is due.</p>
      <p><strong>Fee Type:</strong> ${fee.feeType}</p>
      <p><strong>Amount:</strong> ₹${fee.amount}</p>
      <p><strong>Due Date:</strong> ${new Date(fee.dueDate).toLocaleDateString()}</p>
      <p>Please make the payment before the due date.</p>
      <a href="${process.env.FRONTEND_URL}/student/fees">Pay Now</a>
    `;
    return this.sendEmail(student.user.email, subject, html);
  }

  async sendExamScheduleEmail(student, exam) {
    const subject = 'Exam Schedule Notification';
    const html = `
      <h1>Exam Schedule</h1>
      <p>Dear ${student.user.firstName},</p>
      <p>An exam has been scheduled.</p>
      <p><strong>Exam:</strong> ${exam.name}</p>
      <p><strong>Subject:</strong> ${exam.subject.name}</p>
      <p><strong>Date:</strong> ${new Date(exam.date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${exam.duration} minutes</p>
      <p><strong>Venue:</strong> ${exam.venue}</p>
    `;
    return this.sendEmail(student.user.email, subject, html);
  }

  async sendResultEmail(student, result) {
    const subject = 'Result Published';
    const html = `
      <h1>Result Published</h1>
      <p>Dear ${student.user.firstName},</p>
      <p>Your result has been published.</p>
      <p><strong>Subject:</strong> ${result.exam.subject.name}</p>
      <p><strong>Marks Obtained:</strong> ${result.marksObtained}</p>
      <p><strong>Grade:</strong> ${result.grade}</p>
      <p><strong>Status:</strong> ${result.isPassed ? 'Passed' : 'Failed'}</p>
      <a href="${process.env.FRONTEND_URL}/student/results">View Full Results</a>
    `;
    return this.sendEmail(student.user.email, subject, html);
  }

  async sendAdmissionConfirmationEmail(student) {
    const subject = 'Admission Confirmation';
    const html = `
      <h1>Admission Confirmed!</h1>
      <p>Dear ${student.user.firstName},</p>
      <p>Congratulations! Your admission has been confirmed.</p>
      <p><strong>Enrollment Number:</strong> ${student.enrollmentNumber}</p>
      <p><strong>Course:</strong> ${student.course.name}</p>
      <p><strong>Batch:</strong> ${student.batch}</p>
      <p>Please login to complete your profile.</p>
      <a href="${process.env.FRONTEND_URL}/login">Login Here</a>
    `;
    return this.sendEmail(student.user.email, subject, html);
  }
}

module.exports = new EmailService();