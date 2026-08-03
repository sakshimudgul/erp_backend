const { Hostel, Room, Student, User } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

// In-memory applications (would be a model in real app)
const applications = [];

const hostelController = {
  // Get hostel info
  getHostelInfo: async (req, res) => {
    try {
      const hostels = await Hostel.findAll({
        where: { isActive: true },
        include: [
          {
            model: User,
            as: 'warden',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Hostel info retrieved', { hostels }, 200));
    } catch (error) {
      logger.error('Get hostel info error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get hostel info', null, 500));
    }
  },

  // Get available rooms
  getAvailableRooms: async (req, res) => {
    try {
      const { hostelId } = req.query;

      const where = { isAvailable: true };
      if (hostelId) {
        where.hostelId = hostelId;
      }

      const rooms = await Room.findAll({
        where,
        include: [
          {
            model: Hostel,
            as: 'hostel'
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Available rooms retrieved', { rooms }, 200));
    } catch (error) {
      logger.error('Get available rooms error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get available rooms', null, 500));
    }
  },

  // Apply for hostel
  applyForHostel: async (req, res) => {
    try {
      const { hostelId, roomId, preferredRoomType, specialRequirements } = req.body;
      const userId = req.userId;

      // Check if student already has an application
      const existingApplication = applications.find(
        a => a.userId === userId && a.status === 'pending'
      );

      if (existingApplication) {
        return res.status(400).json(new ApiResponse(false, 'You already have a pending application', null, 400));
      }

      const application = {
        id: Date.now(),
        userId,
        hostelId,
        roomId: roomId || null,
        preferredRoomType,
        specialRequirements,
        status: 'pending',
        appliedAt: new Date()
      };

      applications.push(application);

      res.status(201).json(new ApiResponse(true, 'Application submitted', { application }, 201));
    } catch (error) {
      logger.error('Apply for hostel error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to apply for hostel', null, 500));
    }
  },

  // Get application status
  getApplicationStatus: async (req, res) => {
    try {
      const userId = req.userId;

      const application = applications.find(a => a.userId === userId);

      if (!application) {
        return res.status(404).json(new ApiResponse(false, 'No application found', null, 404));
      }

      res.status(200).json(new ApiResponse(true, 'Application status retrieved', { application }, 200));
    } catch (error) {
      logger.error('Get application status error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get application status', null, 500));
    }
  },

  // Update application
  updateApplication: async (req, res) => {
    try {
      const userId = req.userId;
      const updates = req.body;

      const applicationIndex = applications.findIndex(a => a.userId === userId && a.status === 'pending');

      if (applicationIndex === -1) {
        return res.status(404).json(new ApiResponse(false, 'No pending application found', null, 404));
      }

      applications[applicationIndex] = {
        ...applications[applicationIndex],
        ...updates,
        updatedAt: new Date()
      };

      res.status(200).json(new ApiResponse(true, 'Application updated', { application: applications[applicationIndex] }, 200));
    } catch (error) {
      logger.error('Update application error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to update application', null, 500));
    }
  },

  // Get allocation details
  getAllocationDetails: async (req, res) => {
    try {
      const userId = req.userId;

      const student = await Student.findOne({
        where: { userId }
      });

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student record not found', null, 404));
      }

      // In real application, this would fetch from a RoomAllocation model
      // For now, returning placeholder
      const allocation = {
        allocated: false,
        room: null,
        hostel: null
      };

      res.status(200).json(new ApiResponse(true, 'Allocation details retrieved', { allocation }, 200));
    } catch (error) {
      logger.error('Get allocation details error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get allocation details', null, 500));
    }
  }
};

module.exports = hostelController;