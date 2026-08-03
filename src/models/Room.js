const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  hostelId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Hostels',
      key: 'id'
    }
  },
  roomNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2
  },
  occupied: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  type: {
    type: DataTypes.ENUM('single', 'double', 'triple', 'dormitory'),
    defaultValue: 'double'
  },
  amenities: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

module.exports = Room;