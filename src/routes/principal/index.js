const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { isPrincipal } = require('../../middleware/roleCheck');

// Import principal routes
const collegeRoutes = require('./collegeRoutes');
const admissionRoutes = require('./admissionRoutes');
const departmentRoutes = require('./departmentRoutes');
const studentRoutes = require('./studentRoutes');
const facultyRoutes = require('./facultyRoutes');
const feeRoutes = require('./feeRoutes');
const reportRoutes = require('./reportRoutes');

// All routes require authentication and Principal role
router.use(auth);
router.use(isPrincipal);

// Mount principal routes
router.use('/college', collegeRoutes);
router.use('/admissions', admissionRoutes);
router.use('/departments', departmentRoutes);
router.use('/students', studentRoutes);
router.use('/faculty', facultyRoutes);
router.use('/fees', feeRoutes);
router.use('/reports', reportRoutes);

module.exports = router;