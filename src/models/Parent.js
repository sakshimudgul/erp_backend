const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Parent = sequelize.define('Parent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  occupation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  income: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  relationship: {
    type: DataTypes.ENUM('father', 'mother', 'guardian'),
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Parent;