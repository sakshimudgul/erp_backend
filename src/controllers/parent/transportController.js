const { Student, Transport } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

const transportController = {
  // Get child transport info
  getChildTransportInfo: async (req, res) => {
    try {
      const { childId } = req.params;

      const student = await Student.findByPk(childId);

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student not found', null, 404));
      }

      // In real application, this would fetch from StudentTransport model
      // For now, returning placeholder
      const transportInfo = {
        allocated: false,
        route: null,
        vehicleNumber: null
      };

      res.status(200).json(new ApiResponse(true, 'Child transport info retrieved', { transportInfo }, 200));
    } catch (error) {
      logger.error('Get child transport info error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get child transport info', null, 500));
    }
  },

  // Get child route details
  getChildRouteDetails: async (req, res) => {
    try {
      const { childId } = req.params;

      const student = await Student.findByPk(childId);

      if (!student) {
        return res.status(404).json(new ApiResponse(false, 'Student not found', null, 404));
      }

      // In real application, this would fetch from StudentTransport model
      // For now, returning placeholder
      const routeDetails = {
        allocated: false,
        route: null,
        stops: [],
        driverName: null,
        driverContact: null
      };

      res.status(200).json(new ApiResponse(true, 'Child route details retrieved', { routeDetails }, 200));
    } catch (error) {
      logger.error('Get child route details error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get child route details', null, 500));
    }
  }
};

module.exports = transportController;