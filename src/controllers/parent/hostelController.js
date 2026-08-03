const { Student, Hostel, Room } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

const hostelController = {
  // Get child hostel info
  getChildHostelInfo: async (req, res) => {
    try {
      const { childId } = req.params;

      const student = await Student.findByPk(childId);

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student not found', null, 404));
      }

      // In real application, this would fetch from RoomAllocation model
      // For now, returning placeholder
      const hostelInfo = {
        allocated: false,
        hostel: null,
        room: null
      };

      res.status(200).json(new ApiResponse(true, 'Child hostel info retrieved', { hostelInfo }, 200));
    } catch (error) {
      logger.error('Get child hostel info error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get child hostel info', null, 500));
    }
  },

  // Get child room details
  getChildRoomDetails: async (req, res) => {
    try {
      const { childId } = req.params;

      const student = await Student.findByPk(childId);

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student not found', null, 404));
      }

      // In real application, this would fetch from RoomAllocation model
      // For now, returning placeholder
      const roomDetails = {
        allocated: false,
        roomNumber: null,
        hostelName: null,
        roomType: null
      };

      res.status(200).json(new ApiResponse(true, 'Child room details retrieved', { roomDetails }, 200));
    } catch (error) {
      logger.error('Get child room details error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get child room details', null, 500));
    }
  }
};

module.exports = hostelController;