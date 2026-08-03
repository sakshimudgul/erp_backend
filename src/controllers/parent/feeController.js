const { Fee, Student, Payment } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { generateReceiptNumber, generateTransactionId } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const feeController = {
  // Get child fees
  getChildFees: async (req, res) => {
    try {
      const { childId } = req.params;

      const fees = await Fee.findAll({
        where: { studentId: childId },
        include: [
          {
            model: Payment,
            as: 'payments'
          }
        ],
        order: [['dueDate', 'ASC']]
      });

      res.status(200).json(new ApiResponse(true, 'Child fees retrieved', { fees }, 200));
    } catch (error) {
      logger.error('Get child fees error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get child fees', null, 500));
    }
  },

  // Get child fee details
  getChildFeeDetails: async (req, res) => {
    try {
      const { childId, feeId } = req.params;

      const fee = await Fee.findOne({
        where: {
          id: feeId,
          studentId: childId
        },
        include: [
          {
            model: Payment,
            as: 'payments'
          }
        ]
      });

      if (!fee) {
        return res.status(404).json(new ApiResponse(false, 'Fee record not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'Child fee details retrieved', { fee }, 200));
    } catch (error) {
      logger.error('Get child fee details error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get child fee details', null, 500));
    }
  },

  // Pay child fee
  payChildFee: async (req, res) => {
    try {
      const { childId, feeId } = req.params;
      const { amount, paymentMethod } = req.body;

      const fee = await Fee.findOne({
        where: {
          id: feeId,
          studentId: childId
        }
      });

      if (!fee) {
        return res.status(404).json(new ApiResponse(false, 'Fee record not found', null, 404));
      }

      if (fee.status === 'paid') {
        return res.status(400).json(new ApiResponse(false, 'Fee already paid', null, 400));
      }

      const payment = await Payment.create({
        feeId: fee.id,
        amount: amount || fee.amount,
        paymentMethod,
        transactionId: generateTransactionId(),
        receiptNumber: generateReceiptNumber(),
        paymentDate: new Date(),
        status: 'success',
        receivedBy: req.userId
      });

      const totalPaid = await Payment.sum('amount', {
        where: { feeId: fee.id, status: 'success' }
      });

      if (totalPaid >= fee.amount) {
        await fee.update({
          status: 'paid',
          paidAmount: totalPaid,
          paymentDate: new Date()
        });
      } else {
        await fee.update({
          status: 'partial',
          paidAmount: totalPaid
        });
      }

      res.status(200).json(new ApiResponse(true, 'Fee paid successfully', { payment }, 200));
    } catch (error) {
      logger.error('Pay child fee error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to pay fee', null, 500));
    }
  },

  // Get child payment history
  getChildPaymentHistory: async (req, res) => {
    try {
      const { childId } = req.params;

      const payments = await Payment.findAll({
        include: [
          {
            model: Fee,
            as: 'fee',
            where: { studentId: childId }
          }
        ],
        order: [['paymentDate', 'DESC']]
      });

      res.status(200).json(new ApiResponse(true, 'Child payment history retrieved', { payments }, 200));
    } catch (error) {
      logger.error('Get child payment history error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get child payment history', null, 500));
    }
  }
};

module.exports = feeController;