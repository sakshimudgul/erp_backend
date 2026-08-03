const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transport = sequelize.define('Transport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  vehicleNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  vehicleType: {
    type: DataTypes.ENUM('bus', 'van', 'car', 'minibus'),
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  route: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  stops: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  driverName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  driverContact: {
    type: DataTypes.STRING(20),
    allowNull: true
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

module.exports = Transport;