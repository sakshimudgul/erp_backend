const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Faculty = sequelize.define('Faculty', {
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
  departmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Departments',
      key: 'id'
    }
  },
  employeeId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  designation: {
    type: DataTypes.ENUM('professor', 'associate_professor', 'assistant_professor', 'lecturer', 'instructor', 'teaching_assistant'),
    allowNull: false
  },
  qualification: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  specialization: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  joiningDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isHod: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

module.exports = Faculty;