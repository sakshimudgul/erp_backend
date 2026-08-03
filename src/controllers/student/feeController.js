const { Fee, Student, Payment, User } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { generateReceiptNumber, generateTransactionId } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const feeController = {
  // Get my fees
  getMyFees: async (req, res) => {
    try {
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const fees = await Fee.findAll({
        where: { studentId: student.id },
        include: [
          {
            model: Payment,
            as: 'payments'
          }
        ],
        order: [['dueDate', 'ASC']]
      });

      res.status(200).json(new ApiResponse(true, 'Fees retrieved', { fees }, 200));
    } catch (error) {
      logger.error('Get my fees error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get fees', null, 500));
    }
  },

  // Get fee details
  getFeeDetails: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const fee = await Fee.findOne({
        where: {
          id,
          studentId: student.id
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

      res.status(200).json(new ApiResponse(true, 'Fee details retrieved', { fee }, 200));
    } catch (error) {
      logger.error('Get fee details error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get fee details', null, 500));
    }
  },

  // Pay fee
  payFee: async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, paymentMethod, paymentDetails } = req.body;

      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const fee = await Fee.findOne({
        where: {
          id,
          studentId: student.id
        }
      });

      if (!fee) {
        return res.status(404).json(new ApiResponse(false, 'Fee record not found', null, 404));
      }

      if (fee.status === 'paid') {
        return res.status(400).json(new ApiResponse(false, 'Fee already paid', null, 400));
      }

      // Process payment (in real app, integrate with payment gateway)
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

      // Update fee status
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
      logger.error('Pay fee error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to pay fee', null, 500));
    }
  },

  // Get payment history
  getPaymentHistory: async (req, res) => {
    try {
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const payments = await Payment.findAll({
        include: [
          {
            model: Fee,
            as: 'fee',
            where: { studentId: student.id }
          }
        ],
        order: [['paymentDate', 'DESC']]
      });

      res.status(200).json(new ApiResponse(true, 'Payment history retrieved', { payments }, 200));
    } catch (error) {
      logger.error('Get payment history error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get payment history', null, 500));
    }
  },

  // Get receipts
  getReceipts: async (req, res) => {
    try {
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const payments = await Payment.findAll({
        where: { status: 'success' },
        include: [
          {
            model: Fee,
            as: 'fee',
            where: { studentId: student.id }
          }
        ],
        order: [['paymentDate', 'DESC']]
      });

      const receipts = payments.map(p => ({
        receiptNumber: p.receiptNumber,
        date: p.paymentDate,
        amount: p.amount,
        feeType: p.fee.feeType,
        status: p.status
      }));

      res.status(200).json(new ApiResponse(true, 'Receipts retrieved', { receipts }, 200));
    } catch (error) {
      logger.error('Get receipts error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get receipts', null, 500));
    }
  },

  // Get fee status
  getFeeStatus: async (req, res) => {
    try {
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      const fees = await Fee.findAll({
        where: { studentId: student.id }
      });

      const status = {
        total: fees.length,
        paid: fees.filter(f => f.status === 'paid').length,
        pending: fees.filter(f => f.status === 'pending').length,
        overdue: fees.filter(f => f.status === 'overdue').length,
        partial: fees.filter(f => f.status === 'partial').length,
        totalAmount: fees.reduce((sum, f) => sum + parseFloat(f.amount), 0),
        paidAmount: fees.reduce((sum, f) => sum + parseFloat(f.paidAmount), 0),
        pendingAmount: fees.reduce((sum, f) => {
          if (f.status !== 'paid') {
            return sum + parseFloat(f.amount) - parseFloat(f.paidAmount);
          }
          return sum;
        }, 0)
      };

      res.status(200).json(new ApiResponse(true, 'Fee status retrieved', { status }, 200));
    } catch (error) {
      logger.error('Get fee status error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get fee status', null, 500));
    }
  }
};

module.exports = feeController;