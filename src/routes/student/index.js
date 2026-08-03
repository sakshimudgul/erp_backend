const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { isStudent } = require('../../middleware/roleCheck');

// Import student routes
const academicRoutes = require('./academicRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const timetableRoutes = require('./timetableRoutes');
const resultRoutes = require('./resultRoutes');
const feeRoutes = require('./feeRoutes');
const libraryRoutes = require('./libraryRoutes');
const hostelRoutes = require('./hostelRoutes');
const messageRoutes = require('./messageRoutes');

// All routes require authentication and Student role
router.use(auth);
router.use(isStudent);

// Mount student routes
router.use('/academic', academicRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/timetable', timetableRoutes);
router.use('/results', resultRoutes);
router.use('/fees', feeRoutes);
router.use('/library', libraryRoutes);
router.use('/hostel', hostelRoutes);
router.use('/messages', messageRoutes);

module.exports = router;