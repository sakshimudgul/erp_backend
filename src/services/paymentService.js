const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Payment, Fee, Student } = require('../models');
const { generateReceiptNumber, generateTransactionId } = require('../utils/helpers');
const logger = require('../utils/logger');

class PaymentService {
  async createPaymentSession(feeId, studentId, paymentMethod = 'card') {
    try {
      const fee = await Fee.findOne({
        where: { id: feeId, studentId },
        include: [
          {
            model: Student,
            as: 'student',
            include: [
              {
                model: User,
                as: 'user'
              }
            ]
          }
        ]
      });

      if (!fee) {
        throw new Error('Fee record not found');
      }

      const amount = parseFloat(fee.amount) - parseFloat(fee.paidAmount);
      
      if (amount <= 0) {
        throw new Error('No pending amount to pay');
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `${fee.feeType} Fee - ${fee.student.user.firstName} ${fee.student.user.lastName}`,
                description: `Fee for semester ${fee.semester}`
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        metadata: {
          feeId: fee.id,
          studentId: studentId,
          amount: amount.toString()
        }
      });

      // Create pending payment record
      await Payment.create({
        feeId: fee.id,
        amount: amount,
        paymentMethod: 'online',
        transactionId: generateTransactionId(),
        receiptNumber: generateReceiptNumber(),
        status: 'pending',
        paymentDate: new Date()
      });

      return {
        sessionId: session.id,
        sessionUrl: session.url
      };
    } catch (error) {
      logger.error('Create payment session error:', error);
      throw error;
    }
  }

  async handlePaymentSuccess(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status !== 'paid') {
        throw new Error('Payment not completed');
      }

      const { feeId, studentId, amount } = session.metadata;

      // Update payment record
      const payment = await Payment.findOne({
        where: {
          feeId,
          status: 'pending'
        },
        order: [['createdAt', 'DESC']]
      });

      if (payment) {
        await payment.update({
          status: 'success',
          transactionId: session.payment_intent,
          paymentDate: new Date()
        });
      }

      // Update fee status
      const fee = await Fee.findByPk(feeId);
      if (fee) {
        const totalPaid = await Payment.sum('amount', {
          where: { feeId, status: 'success' }
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
      }

      return { success: true, payment };
    } catch (error) {
      logger.error('Handle payment success error:', error);
      throw error;
    }
  }

  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handlePaymentSuccess(event.data.object.id);
          break;
        case 'payment_intent.succeeded':
          // Handle payment success
          logger.info('Payment intent succeeded:', event.data.object.id);
          break;
        case 'payment_intent.payment_failed':
          // Handle payment failure
          logger.error('Payment failed:', event.data.object.id);
          break;
        default:
          logger.info('Unhandled webhook event:', event.type);
      }
      
      return { received: true };
    } catch (error) {
      logger.error('Handle webhook error:', error);
      throw error;
    }
  }

  async processOfflinePayment(feeId, studentId, amount, paymentMethod, receivedBy) {
    try {
      const fee = await Fee.findOne({
        where: { id: feeId, studentId }
      });

      if (!fee) {
        throw new Error('Fee record not found');
      }

      const payment = await Payment.create({
        feeId: fee.id,
        amount: amount || fee.amount,
        paymentMethod,
        transactionId: generateTransactionId(),
        receiptNumber: generateReceiptNumber(),
        paymentDate: new Date(),
        status: 'success',
        receivedBy
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

      return payment;
    } catch (error) {
      logger.error('Process offline payment error:', error);
      throw error;
    }
  }

  async getPaymentStatus(transactionId) {
    try {
      const payment = await Payment.findOne({
        where: { transactionId },
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
                    as: 'user'
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      return payment;
    } catch (error) {
      logger.error('Get payment status error:', error);
      throw error;
    }
  }

  async refundPayment(paymentId, reason) {
    try {
      const payment = await Payment.findByPk(paymentId);
      
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'success') {
        throw new Error('Only successful payments can be refunded');
      }

      await payment.update({
        status: 'refunded',
        remarks: reason
      });

      return payment;
    } catch (error) {
      logger.error('Refund payment error:', error);
      throw error;
    }
  }

  async generateReceipt(paymentId) {
    try {
      const payment = await Payment.findByPk(paymentId, {
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
                    as: 'user'
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      return {
        receiptNumber: payment.receiptNumber,
        date: payment.paymentDate,
        studentName: `${payment.fee.student.user.firstName} ${payment.fee.student.user.lastName}`,
        enrollmentNumber: payment.fee.student.enrollmentNumber,
        feeType: payment.fee.feeType,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        status: payment.status
      };
    } catch (error) {
      logger.error('Generate receipt error:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();