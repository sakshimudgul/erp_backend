const { Visitor, User } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const visitorController = {
  // Get visitors
  getVisitors: async (req, res) => {
    try {
      const { page, limit, offset, filters } = parseQueryParams(req.query);

      const where = {};
      if (filters.status) where.status = filters.status;

      const { count, rows } = await Visitor.findAndCountAll({
        where,
        limit,
        offset,
        order: [['visitDate', 'DESC']],
        include: [
          {
            model: User,
            as: 'registrar',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Visitors retrieved', {
        visitors: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }, 200));
    } catch (error) {
      logger.error('Get visitors error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get visitors', null, 500));
    }
  },

  // Create visitor
  createVisitor: async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        purpose,
        personToMeet,
        visitDate,
        checkInTime,
        checkOutTime,
        idNumber,
        address,
        remarks
      } = req.body;

      const visitor = await Visitor.create({
        name,
        email,
        phone,
        purpose,
        personToMeet,
        visitDate: visitDate || new Date(),
        checkInTime: checkInTime || new Date().toLocaleTimeString(),
        checkOutTime,
        idNumber,
        address,
        remarks,
        status: 'pending',
        registeredBy: req.userId
      });

      const createdVisitor = await Visitor.findByPk(visitor.id, {
        include: [
          {
            model: User,
            as: 'registrar',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

      res.status(201).json(new ApiResponse(true, 'Visitor created', { visitor: createdVisitor }, 201));
    } catch (error) {
      logger.error('Create visitor error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to create visitor', null, 500));
    }
  },

  // Get visitor by ID
  getVisitorById: async (req, res) => {
    try {
      const { id } = req.params;

      const visitor = await Visitor.findByPk(id, {
        include: [
          {
            model: User,
            as: 'registrar',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

      if (!visitor) {
        return res.status(404).json(new ApiResponse(false, 'Visitor not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'Visitor retrieved', { visitor }, 200));
    } catch (error) {
      logger.error('Get visitor by ID error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get visitor', null, 500));
    }
  },

  // Update visitor
  updateVisitor: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const visitor = await Visitor.findByPk(id);
      if (!visitor) {
        return res.status(404).json(new ApiResponse(false, 'Visitor not found', null, 404));
      }

      await visitor.update(updates);

      const updatedVisitor = await Visitor.findByPk(id, {
        include: [
          {
            model: User,
            as: 'registrar',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Visitor updated', { visitor: updatedVisitor }, 200));
    } catch (error) {
      logger.error('Update visitor error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update visitor', null, 500));
    }
  },

  // Delete visitor
  deleteVisitor: async (req, res) => {
    try {
      const { id } = req.params;

      const visitor = await Visitor.findByPk(id);
      if (!visitor) {
        return res.status(404).json(new ApiResponse(false, 'Visitor not found', null, 404));
      }

      await visitor.destroy();

      res.status(200).json(new ApiResponse(true, 'Visitor deleted', null, 200));
    } catch (error) {
      logger.error('Delete visitor error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to delete visitor', null, 500));
    }
  },

  // Check in
  checkIn: async (req, res) => {
    try {
      const { id } = req.params;

      const visitor = await Visitor.findByPk(id);
      if (!visitor) {
        return res.status(404).json(new ApiResponse(false, 'Visitor not found', null, 404));
      }

      await visitor.update({
        checkInTime: new Date().toLocaleTimeString(),
        status: 'in_visit'
      });

      res.status(200).json(new ApiResponse(true, 'Visitor checked in', null, 200));
    } catch (error) {
      logger.error('Check in error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to check in visitor', null, 500));
    }
  },

  // Check out
  checkOut: async (req, res) => {
    try {
      const { id } = req.params;

      const visitor = await Visitor.findByPk(id);
      if (!visitor) {
        return res.status(404).json(new ApiResponse(false, 'Visitor not found', null, 404));
      }

      await visitor.update({
        checkOutTime: new Date().toLocaleTimeString(),
        status: 'completed'
      });

      res.status(200).json(new ApiResponse(true, 'Visitor checked out', null, 200));
    } catch (error) {
      logger.error('Check out error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to check out visitor', null, 500));
    }
  },

  // Get daily visitors
  getDailyVisitors: async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const visitors = await Visitor.findAll({
        where: {
          visitDate: today
        },
        order: [['checkInTime', 'ASC']]
      });

      res.status(200).json(new ApiResponse(true, 'Daily visitors retrieved', { visitors }, 200));
    } catch (error) {
      logger.error('Get daily visitors error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get daily visitors', null, 500));
    }
  },

  // Get weekly visitors
  getWeeklyVisitors: async (req, res) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const visitors = await Visitor.findAll({
        where: {
          visitDate: {
            [Op.gte]: startDate
          }
        },
        order: [['visitDate', 'ASC']]
      });

      // Group by day
      const grouped = {};
      visitors.forEach(v => {
        const date = v.visitDate;
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(v);
      });

      res.status(200).json(new ApiResponse(true, 'Weekly visitors retrieved', { visitors: grouped }, 200));
    } catch (error) {
      logger.error('Get weekly visitors error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get weekly visitors', null, 500));
    }
  }
};

module.exports = visitorController;