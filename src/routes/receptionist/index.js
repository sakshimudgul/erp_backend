const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { isReceptionist } = require('../../middleware/roleCheck');

// Import receptionist routes
const admissionRoutes = require('./admissionRoutes');
const visitorRoutes = require('./visitorRoutes');
const studentRoutes = require('./studentRoutes');
const idRoutes = require('./idRoutes');
const inquiryRoutes = require('./inquiryRoutes');

// All routes require authentication and Receptionist role
router.use(auth);
router.use(isReceptionist);

// Mount receptionist routes
router.use('/admissions', admissionRoutes);
router.use('/visitors', visitorRoutes);
router.use('/students', studentRoutes);
router.use('/ids', idRoutes);
router.use('/inquiries', inquiryRoutes);

module.exports = router;