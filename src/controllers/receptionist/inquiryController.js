const { Inquiry, User } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const inquiryController = {
  // Get inquiries
  getInquiries: async (req, res) => {
    try {
      const { page, limit, offset, filters } = parseQueryParams(req.query);

      const where = {};
      if (filters.status) where.status = filters.status;
      if (filters.priority) where.priority = filters.priority;
      if (filters.source) where.source = filters.source;

      const { count, rows } = await Inquiry.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'assignedToUser',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Inquiries retrieved', {
        inquiries: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }, 200));
    } catch (error) {
      logger.error('Get inquiries error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get inquiries', null, 500));
    }
  },

  // Create inquiry
  createInquiry: async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        subject,
        message,
        source,
        priority,
        assignedTo
      } = req.body;

      const inquiry = await Inquiry.create({
        name,
        email,
        phone,
        subject,
        message,
        source: source || 'website',
        priority: priority || 'medium',
        status: 'new',
        assignedTo
      });

      const createdInquiry = await Inquiry.findByPk(inquiry.id, {
        include: [
          {
            model: User,
            as: 'assignedToUser',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      res.status(201).json(new ApiResponse(true, 'Inquiry created', { inquiry: createdInquiry }, 201));
    } catch (error) {
      logger.error('Create inquiry error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to create inquiry', null, 500));
    }
  },

  // Get inquiry by ID
  getInquiryById: async (req, res) => {
    try {
      const { id } = req.params;

      const inquiry = await Inquiry.findByPk(id, {
        include: [
          {
            model: User,
            as: 'assignedToUser',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      if (!inquiry) {
        return res.status(404).json(new ApiResponse(false, 'Inquiry not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'Inquiry retrieved', { inquiry }, 200));
    } catch (error) {
      logger.error('Get inquiry by ID error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get inquiry', null, 500));
    }
  },

  // Update inquiry
  updateInquiry: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const inquiry = await Inquiry.findByPk(id);
      if (!inquiry) {
        return res.status(404).json(new ApiResponse(false, 'Inquiry not found', null, 404));
      }

      await inquiry.update(updates);

      const updatedInquiry = await Inquiry.findByPk(id, {
        include: [
          {
            model: User,
            as: 'assignedToUser',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Inquiry updated', { inquiry: updatedInquiry }, 200));
    } catch (error) {
      logger.error('Update inquiry error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update inquiry', null, 500));
    }
  },

  // Delete inquiry
  deleteInquiry: async (req, res) => {
    try {
      const { id } = req.params;

      const inquiry = await Inquiry.findByPk(id);
      if (!inquiry) {
        return res.status(404).json(new ApiResponse(false, 'Inquiry not found', null, 404));
      }

      await inquiry.destroy();

      res.status(200).json(new ApiResponse(true, 'Inquiry deleted', null, 200));
    } catch (error) {
      logger.error('Delete inquiry error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to delete inquiry', null, 500));
    }
  },

  // Respond to inquiry
  respondToInquiry: async (req, res) => {
    try {
      const { id } = req.params;
      const { response } = req.body;

      const inquiry = await Inquiry.findByPk(id);
      if (!inquiry) {
        return res.status(404).json(new ApiResponse(false, 'Inquiry not found', null, 404));
      }

      await inquiry.update({
        response,
        responseDate: new Date(),
        status: 'resolved'
      });

      res.status(200).json(new ApiResponse(true, 'Response sent', null, 200));
    } catch (error) {
      logger.error('Respond to inquiry error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to send response', null, 500));
    }
  },

  // Get inquiry summary
  getInquirySummary: async (req, res) => {
    try {
      const total = await Inquiry.count();
      const newInquiries = await Inquiry.count({ where: { status: 'new' } });
      const inProgress = await Inquiry.count({ where: { status: 'in_progress' } });
      const resolved = await Inquiry.count({ where: { status: 'resolved' } });
      const closed = await Inquiry.count({ where: { status: 'closed' } });

      const bySource = await Inquiry.findAll({
        attributes: [
          'source',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['source']
      });

      const byPriority = await Inquiry.findAll({
        attributes: [
          'priority',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['priority']
      });

      const summary = {
        total,
        newInquiries,
        inProgress,
        resolved,
        closed,
        bySource,
        byPriority,
        resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(2) : 0
      };

      res.status(200).json(new ApiResponse(true, 'Inquiry summary retrieved', { summary }, 200));
    } catch (error) {
      logger.error('Get inquiry summary error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get inquiry summary', null, 500));
    }
  }
};

module.exports = inquiryController;