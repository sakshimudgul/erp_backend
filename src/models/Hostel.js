const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Hostel = sequelize.define('Hostel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('boys', 'girls', 'mixed'),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contactNumber: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  wardenId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  totalRooms: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  availableRooms: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  fees: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

module.exports = Hostel;