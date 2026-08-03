const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { isFaculty } = require('../../middleware/roleCheck');

// Import faculty routes
const teachingRoutes = require('./teachingRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const assignmentRoutes = require('./assignmentRoutes');
const marksRoutes = require('./marksRoutes');
const examRoutes = require('./examRoutes');
const materialRoutes = require('./materialRoutes');
const messageRoutes = require('./messageRoutes');

// All routes require authentication and Faculty role
router.use(auth);
router.use(isFaculty);

// Mount faculty routes
router.use('/teaching', teachingRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/marks', marksRoutes);
router.use('/exams', examRoutes);
router.use('/materials', materialRoutes);
router.use('/messages', messageRoutes);

module.exports = router;