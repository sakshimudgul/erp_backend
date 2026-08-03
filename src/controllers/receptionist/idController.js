const { Student, User } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

// In-memory ID cards (would be a model in real app)
const idCards = [];

const idController = {
  // Get ID cards
  getIdCards: async (req, res) => {
    try {
      const { page, limit, offset } = parseQueryParams(req.query);

      const start = (page - 1) * limit;
      const end = start + limit;
      const paginated = idCards.slice(start, end);

      res.status(200).json(new ApiResponse(true, 'ID cards retrieved', {
        idCards: paginated,
        pagination: {
          total: idCards.length,
          page,
          limit,
          pages: Math.ceil(idCards.length / limit)
        }
      }, 200));
    } catch (error) {
      logger.error('Get ID cards error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get ID cards', null, 500));
    }
  },

  // Create ID card
  createIdCard: async (req, res) => {
    try {
      const { studentId, issueDate, expiryDate, status } = req.body;

      const student = await Student.findByPk(studentId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profileImage']
          }
        ]
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student not found', null, 404));
      }

      const idCard = {
        id: Date.now(),
        studentId,
        student,
        issueDate: issueDate || new Date(),
        expiryDate: expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: status || 'active',
        createdAt: new Date()
      };

      idCards.push(idCard);

      res.status(201).json(new ApiResponse(true, 'ID card created', { idCard }, 201));
    } catch (error) {
      logger.error('Create ID card error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to create ID card', null, 500));
    }
  },

  // Get ID card
  getIdCard: async (req, res) => {
    try {
      const { id } = req.params;

      const idCard = idCards.find(card => card.id === parseInt(id));

      if (!idCard) {
        return res.status(404).json(new ApiResponse(false, 'ID card not found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'ID card retrieved', { idCard }, 200));
    } catch (error) {
      logger.error('Get ID card error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get ID card', null, 500));
    }
  },

  // Update ID card
  updateIdCard: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const idCardIndex = idCards.findIndex(card => card.id === parseInt(id));

      if (idCardIndex === -1) {
        return res.status(404).json(new ApiResponse(false, 'ID card not found', null, 404));
      }

      idCards[idCardIndex] = {
        ...idCards[idCardIndex],
        ...updates,
        updatedAt: new Date()
      };

      res.status(200).json(new ApiResponse(true, 'ID card updated', { idCard: idCards[idCardIndex] }, 200));
    } catch (error) {
      logger.error('Update ID card error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update ID card', null, 500));
    }
  },

  // Delete ID card
  deleteIdCard: async (req, res) => {
    try {
      const { id } = req.params;

      const idCardIndex = idCards.findIndex(card => card.id === parseInt(id));

      if (idCardIndex === -1) {
        return res.status(404).json(new ApiResponse(false, 'ID card not found', null, 404));
      }

      idCards.splice(idCardIndex, 1);

      res.status(200).json(new ApiResponse(true, 'ID card deleted', null, 200));
    } catch (error) {
      logger.error('Delete ID card error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to delete ID card', null, 500));
    }
  },

  // Generate ID cards
  generateIdCards: async (req, res) => {
    try {
      const { studentIds } = req.body;

      if (!Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json(new ApiResponse(false, 'Student IDs required', null, 400));
      }

      const generated = [];
      for (const studentId of studentIds) {
        const student = await Student.findByPk(studentId, {
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profileImage']
            }
          ]
        });

        if (student) {
          const idCard = {
            id: Date.now() + Math.random(),
            studentId,
            student,
            issueDate: new Date(),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            status: 'active',
            createdAt: new Date()
          };
          idCards.push(idCard);
          generated.push(idCard);
        }
      }

      res.status(200).json(new ApiResponse(true, 'ID cards generated', { count: generated.length, generated }, 200));
    } catch (error) {
      logger.error('Generate ID cards error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to generate ID cards', null, 500));
    }
  },

  // Print ID card
  printIdCard: async (req, res) => {
    try {
      const { id } = req.params;

      const idCard = idCards.find(card => card.id === parseInt(id));

      if (!idCard) {
        return res.status(404).json(new ApiResponse(false, 'ID card not found', null, 404));
      }

      // In real application, this would generate a printable PDF
      res.status(200).json(new ApiResponse(true, 'ID card ready for print', { idCard }, 200));
    } catch (error) {
      logger.error('Print ID card error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to print ID card', null, 500));
    }
  }
};

module.exports = idController;