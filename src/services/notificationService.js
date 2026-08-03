const { Notification } = require('../models');
const emailService = require('./emailService');
const smsService = require('./smsService');
const logger = require('../utils/logger');

class NotificationService {
  async createNotification(userId, title, message, type = 'info', link = null, priority = 'medium') {
    try {
      const notification = await Notification.create({
        userId,
        title,
        message,
        type,
        link,
        priority,
        read: false
      });
      return notification;
    } catch (error) {
      logger.error('Create notification error:', error);
      throw error;
    }
  }

  async sendNotification(user, title, message, type = 'info', link = null, priority = 'medium') {
    try {
      // Save notification
      const notification = await this.createNotification(user.id, title, message, type, link, priority);

      // Send email based on priority
      if (priority === 'high' || priority === 'urgent') {
        await emailService.sendEmail(user.email, title, message);
      }

      // Send SMS for urgent notifications
      if (priority === 'urgent' && user.phone) {
        await smsService.sendSms(user.phone, message.substring(0, 160));
      }

      return notification;
    } catch (error) {
      logger.error('Send notification error:', error);
      throw error;
    }
  }

  async sendBulkNotification(users, title, message, type = 'info', priority = 'medium') {
    try {
      const notifications = [];
      for (const user of users) {
        const notification = await this.createNotification(user.id, title, message, type, null, priority);
        notifications.push(notification);

        if (priority === 'high' || priority === 'urgent') {
          await emailService.sendEmail(user.email, title, message);
        }
      }
      return notifications;
    } catch (error) {
      logger.error('Send bulk notification error:', error);
      throw error;
    }
  }

  async sendAttendanceNotification(student, subject, status) {
    const title = 'Attendance Update';
    const message = `You were marked ${status} for ${subject.name} on ${new Date().toLocaleDateString()}.`;
    const notification = await this.createNotification(student.userId, title, message, 'warning');
    
    if (status === 'absent') {
      await emailService.sendEmail(student.user.email, title, message);
    }
    
    return notification;
  }

  async sendFeeNotification(student, fee) {
    const title = 'Fee Payment Reminder';
    const message = `Fee of ₹${fee.amount} for ${fee.feeType} is due on ${new Date(fee.dueDate).toLocaleDateString()}.`;
    const notification = await this.createNotification(student.userId, title, message, 'warning');
    
    if (fee.status === 'overdue') {
      await emailService.sendEmail(student.user.email, title, message);
      if (student.user.phone) {
        await smsService.sendSms(student.user.phone, message.substring(0, 160));
      }
    }
    
    return notification;
  }

  async sendExamNotification(student, exam) {
    const title = 'Exam Schedule';
    const message = `${exam.name} for ${exam.subject.name} on ${new Date(exam.date).toLocaleDateString()} at ${exam.venue}.`;
    const notification = await this.createNotification(student.userId, title, message, 'info');
    
    await emailService.sendEmail(student.user.email, title, message);
    return notification;
  }

  async sendResultNotification(student, result) {
    const title = 'Result Published';
    const message = `Result for ${result.exam.subject.name}: ${result.marksObtained} marks. ${result.isPassed ? 'Passed' : 'Failed'}`;
    const notification = await this.createNotification(student.userId, title, message, 'success');
    
    await emailService.sendEmail(student.user.email, title, message);
    return notification;
  }

  async sendAdmissionNotification(student) {
    const title = 'Admission Update';
    const message = `Your admission has been ${student.status}. Enrollment: ${student.enrollmentNumber}`;
    const notification = await this.createNotification(student.userId, title, message, 'success');
    
    if (student.status === 'active') {
      await emailService.sendEmail(student.user.email, title, message);
    }
    
    return notification;
  }

  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, userId }
      });
      
      if (notification) {
        await notification.update({
          read: true,
          readAt: new Date()
        });
      }
      
      return notification;
    } catch (error) {
      logger.error('Mark notification as read error:', error);
      throw error;
    }
  }

  async getUnreadCount(userId) {
    try {
      return await Notification.count({
        where: { userId, read: false }
      });
    } catch (error) {
      logger.error('Get unread count error:', error);
      throw error;
    }
  }

  async getNotifications(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const { count, rows } = await Notification.findAndCountAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });
      
      return {
        notifications: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Get notifications error:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();