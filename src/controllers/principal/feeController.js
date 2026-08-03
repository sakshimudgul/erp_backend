const { Fee, Student, User, Payment } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const feeController = {
  // Get fee structure
  getFeeStructure: async (req, res) => {
    try {
      // In real application, this would be from a FeeStructure model
      const feeStructure = {
        tuition: 50000,
        hostel: 30000,
        library: 5000,
        transport: 10000,
        sports: 5000,
        laboratory: 8000
      };

      res.status(200).json(new ApiResponse(true, 'Fee structure retrieved', { feeStructure }, 200));
    } catch (error) {
      logger.error('Get fee structure error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get fee structure', null, 500));
    }
  },

  // Update fee structure
  updateFeeStructure: async (req, res) => {
    try {
      const updates = req.body;

      // In real application, this would update FeeStructure model
      res.status(200).json(new ApiResponse(true, 'Fee structure updated', null, 200));
    } catch (error) {
      logger.error('Update fee structure error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update fee structure', null, 500));
    }
  },

  // Get fee collections
  getFeeCollections: async (req, res) => {
    try {
      const { page, limit, offset, filters } = parseQueryParams(req.query);

      const where = {};
      if (filters.status) where.status = filters.status;
      if (filters.feeType) where.feeType = filters.feeType;

      const { count, rows } = await Fee.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
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
            model: Payment,
            as: 'payments'
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Fee collections retrieved', {
        fees: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }, 200));
    } catch (error) {
      logger.error('Get fee collections error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get fee collections', null, 500));
    }
  },

  // Get fee collection by ID
  getFeeCollectionById: async (req, res) => {
    try {
      const { id } = req.params;

      const fee = await Fee.findByPk(id, {
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
            model: Payment,
            as: 'payments'
          }
        ]
      });

      if (!fee) {
        return res.status(404).json(new ApiResponse(false, 'Fee record not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'Fee collection retrieved', { fee }, 200));
    } catch (error) {
      logger.error('Get fee collection by ID error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get fee collection', null, 500));
    }
  },

  // Get fee summary
  getFeeSummary: async (req, res) => {
    try {
      const totalFees = await Fee.sum('amount');
      const totalPaid = await Fee.sum('paidAmount');
      const totalPending = totalFees - totalPaid;

      const byStatus = await Fee.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        group: ['status']
      });

      const summary = {
        totalFees,
        totalPaid,
        totalPending,
        collectionRate: totalFees > 0 ? ((totalPaid / totalFees) * 100).toFixed(2) : 0,
        byStatus
      };

      res.status(200).json(new ApiResponse(true, 'Fee summary retrieved', { summary }, 200));
    } catch (error) {
      logger.error('Get fee summary error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get fee summary', null, 500));
    }
  },

  // Get collection report
  getCollectionReport: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const payments = await Payment.findAll({
        where: {
          paymentDate: {
            [Op.between]: [new Date(startDate), new Date(endDate)]
          },
          status: 'success'
        },
        include: [
          {
            model: Fee,
            as: 'fee',
            include: [
              {
                model: Student,
                as: 'student',
                include: [
                  {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName']
                  }
                ]
              }
            ]
          }
        ]
      });

      const total = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

      const report = {
        startDate,
        endDate,
        totalCollected: total,
        totalTransactions: payments.length,
        payments
      };

      res.status(200).json(new ApiResponse(true, 'Collection report generated', { report }, 200));
    } catch (error) {
      logger.error('Get collection report error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get collection report', null, 500));
    }
  },

  // Get pending fees
  getPendingFees: async (req, res) => {
    try {
      const pendingFees = await Fee.findAll({
        where: {
          status: ['pending', 'overdue']
        },
        include: [
          {
            model: Student,
            as: 'student',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
              }
            ]
          }
        ],
        order: [['dueDate', 'ASC']]
      });

      res.status(200).json(new ApiResponse(true, 'Pending fees retrieved', { pendingFees }, 200));
    } catch (error) {
      logger.error('Get pending fees error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get pending fees', null, 500));
    }
  }
};

module.exports = feeController;