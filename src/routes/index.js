const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

// Role-based routes
const hodRoutes = require('./hod');
const principalRoutes = require('./principal');
const facultyRoutes = require('./faculty');
const studentRoutes = require('./student');
const parentRoutes = require('./parent');
const receptionistRoutes = require('./receptionist');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Role-specific routes
router.use('/hod', hodRoutes);
router.use('/principal', principalRoutes);
router.use('/faculty', facultyRoutes);
router.use('/student', studentRoutes);
router.use('/parent', parentRoutes);
router.use('/receptionist', receptionistRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;