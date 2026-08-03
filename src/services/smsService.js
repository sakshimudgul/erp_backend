const twilio = require('twilio');
const logger = require('../utils/logger');

class SmsService {
  constructor() {
    this.client = null;
    this.initializeClient();
  }

  initializeClient() {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        this.client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        logger.info('SMS service initialized');
      } else {
        logger.warn('Twilio credentials not configured');
      }
    } catch (error) {
      logger.error('Failed to initialize SMS service:', error);
    }
  }

  async sendSms(to, message) {
    try {
      if (!this.client) {
        logger.warn('SMS service not configured');
        return { success: false, message: 'SMS service not configured' };
      }

      const result = await this.client.messages.create({
        body: message,
        to: to,
        from: process.env.TWILIO_PHONE_NUMBER
      });

      logger.info(`SMS sent to ${to}: ${result.sid}`);
      return { success: true, sid: result.sid };
    } catch (error) {
      logger.error('SMS sending failed:', error);
      throw error;
    }
  }

  async sendAttendanceAlert(student, subject, status) {
    const message = `Alert: ${student.user.firstName} was marked ${status} for ${subject.name} on ${new Date().toLocaleDateString()}.`;
    return this.sendSms(student.user.phone, message);
  }

  async sendFeeReminder(student, fee) {
    const message = `Reminder: Fee of ₹${fee.amount} for ${fee.feeType} is due on ${new Date(fee.dueDate).toLocaleDateString()}. Please pay before due date.`;
    return this.sendSms(student.user.phone, message);
  }

  async sendExamReminder(student, exam) {
    const message = `Reminder: ${exam.name} for ${exam.subject.name} on ${new Date(exam.date).toLocaleDateString()} at ${exam.venue}.`;
    return this.sendSms(student.user.phone, message);
  }

  async sendResultNotification(student, result) {
    const message = `Result published for ${result.exam.subject.name}. Marks: ${result.marksObtained}. Status: ${result.isPassed ? 'Passed' : 'Failed'}.`;
    return this.sendSms(student.user.phone, message);
  }

  async sendEmergencyAlert(user, message) {
    return this.sendSms(user.phone, `EMERGENCY: ${message}`);
  }
}

module.exports = new SmsService();