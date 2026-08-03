const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { isHOD } = require('../../middleware/roleCheck');

// Import HOD routes
const departmentRoutes = require('./departmentRoutes');
const facultyRoutes = require('./facultyRoutes');
const subjectRoutes = require('./subjectRoutes');
const courseRoutes = require('./courseRoutes');
const reportRoutes = require('./reportRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const approvalRoutes = require('./approvalRoutes');

// All routes require authentication and HOD role
router.use(auth);
router.use(isHOD);

// Mount HOD routes
router.use('/departments', departmentRoutes);
router.use('/faculty', facultyRoutes);
router.use('/subjects', subjectRoutes);
router.use('/courses', courseRoutes);
router.use('/reports', reportRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/approvals', approvalRoutes);

module.exports = router;