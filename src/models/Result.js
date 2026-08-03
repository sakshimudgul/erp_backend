const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Result = sequelize.define('Result', {
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
  examId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Exams',
      key: 'id'
    }
  },
  marksObtained: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  grade: {
    type: DataTypes.STRING(2),
    allowNull: true
  },
  gradePoints: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  isPassed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  enteredBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

module.exports = Result;