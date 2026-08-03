const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Inquiry = sequelize.define('Inquiry', {
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
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  source: {
    type: DataTypes.ENUM('website', 'phone', 'email', 'walk_in', 'referral', 'social_media', 'other'),
    defaultValue: 'website'
  },
  status: {
    type: DataTypes.ENUM('new', 'in_progress', 'resolved', 'closed', 'spam'),
    defaultValue: 'new'
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  followUpDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  responseDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Inquiry;