const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
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
  enrollmentNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Courses',
      key: 'id'
    }
  },
  batch: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 8
    }
  },
  admissionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  admissionType: {
    type: DataTypes.ENUM('regular', 'lateral', 'transfer'),
    defaultValue: 'regular'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended', 'graduated', 'dropped_out'),
    defaultValue: 'active'
  },
  fatherName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  motherName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  emergencyContact: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  bloodGroup: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: true
  },
  guardianPhone: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Student;