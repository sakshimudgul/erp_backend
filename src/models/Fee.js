const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Fee = sequelize.define('Fee', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Students',
      key: 'id'
    }
  },
  feeType: {
    type: DataTypes.ENUM('tuition', 'hostel', 'library', 'transport', 'sports', 'laboratory', 'other'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'overdue', 'partial', 'waived'),
    defaultValue: 'pending'
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  academicYear: {
    type: DataTypes.STRING(9),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Fee;