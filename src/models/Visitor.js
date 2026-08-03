const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Visitor = sequelize.define('Visitor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  purpose: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  personToMeet: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  visitDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  checkInTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  checkOutTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  idNumber: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_visit', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  registeredBy: {
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

module.exports = Visitor;