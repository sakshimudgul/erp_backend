const { Message, User } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const messageController = {
  // Get messages
  getMessages: async (req, res) => {
    try {
      const { page, limit, offset } = parseQueryParams(req.query);

      const where = {
        receiverId: req.userId
      };

      const { count, rows } = await Message.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage']
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Messages retrieved', {
        messages: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }, 200));
    } catch (error) {
      logger.error('Get messages error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get messages', null, 500));
    }
  },

  // Get message by ID
  getMessageById: async (req, res) => {
    try {
      const { id } = req.params;

      const message = await Message.findByPk(id, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage']
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage']
          }
        ]
      });

      if (!message) {
        return res.status(404).json(new ApiResponse(false, 'Message not found', null, 404));
      }

      // Mark as read if user is the receiver
      if (message.receiverId === req.userId && !message.isRead) {
        await message.update({
          isRead: true,
          readAt: new Date()
        });
      }

      res.status(200).json(new ApiResponse(true, 'Message retrieved', { message }, 200));
    } catch (error) {
      logger.error('Get message by ID error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get message', null, 500));
    }
  },

  // Send message
  sendMessage: async (req, res) => {
    try {
      const { receiverId, subject, content, priority } = req.body;

      const receiver = await User.findByPk(receiverId);
      if (!receiver) {
        return res.status(404).json(new ApiResponse(false, 'Receiver not found', null, 404));
      }

      const message = await Message.create({
        senderId: req.userId,
        receiverId,
        subject,
        content,
        priority: priority || 'normal'
      });

      const createdMessage = await Message.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      res.status(201).json(new ApiResponse(true, 'Message sent', { message: createdMessage }, 201));
    } catch (error) {
      logger.error('Send message error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to send message', null, 500));
    }
  },

  // Delete message
  deleteMessage: async (req, res) => {
    try {
      const { id } = req.params;

      const message = await Message.findByPk(id);
      if (!message) {
        return res.status(404).json(new ApiResponse(false, 'Message not found', null, 404));
      }

      // Only sender or receiver can delete
      if (message.senderId !== req.userId && message.receiverId !== req.userId) {
        return res.status(403).json(new ApiResponse(false, 'Unauthorized to delete this message', null, 403));
      }

      await message.destroy();

      res.status(200).json(new ApiResponse(true, 'Message deleted', null, 200));
    } catch (error) {
      logger.error('Delete message error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to delete message', null, 500));
    }
  },

  // Mark as read
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;

      const message = await Message.findByPk(id);
      if (!message) {
        return res.status(404).json(new ApiResponse(false, 'Message not found', null, 404));
      }

      if (message.receiverId !== req.userId) {
        return res.status(403).json(new ApiResponse(false, 'Unauthorized to mark this message as read', null, 403));
      }

      await message.update({
        isRead: true,
        readAt: new Date()
      });

      res.status(200).json(new ApiResponse(true, 'Message marked as read', null, 200));
    } catch (error) {
      logger.error('Mark as read error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to mark message as read', null, 500));
    }
  },

  // Send group message
  sendGroupMessage: async (req, res) => {
    try {
      const { receiverIds, subject, content, priority } = req.body;

      if (!Array.isArray(receiverIds) || receiverIds.length === 0) {
        return res.status(400).json(new ApiResponse(false, 'At least one receiver required', null, 400));
      }

      const messages = [];
      for (const receiverId of receiverIds) {
        const receiver = await User.findByPk(receiverId);
        if (receiver) {
          const message = await Message.create({
            senderId: req.userId,
            receiverId,
            subject,
            content,
            priority: priority || 'normal'
          });
          messages.push(message);
        }
      }

      res.status(201).json(new ApiResponse(true, 'Group messages sent', { count: messages.length }, 201));
    } catch (error) {
      logger.error('Send group message error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to send group messages', null, 500));
    }
  },

  // Get message threads
  getMessageThreads: async (req, res) => {
    try {
      // Get unique conversations
      const sentMessages = await Message.findAll({
        where: { senderId: req.userId },
        attributes: ['receiverId'],
        group: ['receiverId']
      });

      const receivedMessages = await Message.findAll({
        where: { receiverId: req.userId },
        attributes: ['senderId'],
        group: ['senderId']
      });

      const userIds = new Set();
      sentMessages.forEach(m => userIds.add(m.receiverId));
      receivedMessages.forEach(m => userIds.add(m.senderId));

      const users = await User.findAll({
        where: { id: { [Op.in]: Array.from(userIds) } },
        attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage']
      });

      // Get last message for each conversation
      const threads = [];
      for (const user of users) {
        const lastMessage = await Message.findOne({
          where: {
            [Op.or]: [
              { senderId: req.userId, receiverId: user.id },
              { senderId: user.id, receiverId: req.userId }
            ]
          },
          order: [['createdAt', 'DESC']]
        });

        if (lastMessage) {
          const unreadCount = await Message.count({
            where: {
              senderId: user.id,
              receiverId: req.userId,
              isRead: false
            }
          });

          threads.push({
            user,
            lastMessage,
            unreadCount
          });
        }
      }

      // Sort by last message time
      threads.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

      res.status(200).json(new ApiResponse(true, 'Message threads retrieved', { threads }, 200));
    } catch (error) {
      logger.error('Get message threads error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get message threads', null, 500));
    }
  },

  // Get thread details
  getThreadDetails: async (req, res) => {
    try {
      const { id } = req.params;

      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { senderId: req.userId, receiverId: id },
            { senderId: id, receiverId: req.userId }
          ]
        },
        order: [['createdAt', 'ASC']],
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage']
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage']
          }
        ]
      });

      // Mark all messages from the other user as read
      await Message.update(
        { isRead: true, readAt: new Date() },
        {
          where: {
            senderId: id,
            receiverId: req.userId,
            isRead: false
          }
        }
      );

      res.status(200).json(new ApiResponse(true, 'Thread details retrieved', { messages }, 200));
    } catch (error) {
      logger.error('Get thread details error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get thread details', null, 500));
    }
  }
};

module.exports = messageController;