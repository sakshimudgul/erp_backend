const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  isbn: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  author: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  publisher: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  edition: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  subjectId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Subjects',
      key: 'id'
    }
  },
  libraryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Libraries',
      key: 'id'
    }
  },
  totalCopies: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  availableCopies: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  rackNumber: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

module.exports = Book;