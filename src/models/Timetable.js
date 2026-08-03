const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Timetable = sequelize.define('Timetable', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  subjectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Subjects',
      key: 'id'
    }
  },
  facultyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Faculties',
      key: 'id'
    }
  },
  dayOfWeek: {
    type: DataTypes.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  roomNumber: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  batch: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  academicYear: {
    type: DataTypes.STRING(9),
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

module.exports = Timetable;