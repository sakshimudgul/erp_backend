const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { isParent } = require('../../middleware/roleCheck');

// Import parent routes
const childRoutes = require('./childRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const resultRoutes = require('./resultRoutes');
const feeRoutes = require('./feeRoutes');
const hostelRoutes = require('./hostelRoutes');
const transportRoutes = require('./transportRoutes');
const messageRoutes = require('./messageRoutes');

// All routes require authentication and Parent role
router.use(auth);
router.use(isParent);

// Mount parent routes
router.use('/children', childRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/results', resultRoutes);
router.use('/fees', feeRoutes);
router.use('/hostel', hostelRoutes);
router.use('/transport', transportRoutes);
router.use('/messages', messageRoutes);

module.exports = router;