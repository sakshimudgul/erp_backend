const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  feeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Fees',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'upi', 'bank_transfer', 'online', 'other'),
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  receiptNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('success', 'failed', 'pending', 'refunded'),
    defaultValue: 'pending'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  receivedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = Payment;