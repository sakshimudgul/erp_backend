const express = require('express');
const router = express.Router();
const collegeController = require('../../controllers/principal/collegeController');
const { uploadProfileImage } = require('../../middleware/upload');

// College info management
router.get('/info', collegeController.getCollegeInfo);
router.put('/info', collegeController.updateCollegeInfo);

// College statistics
router.get('/stats', collegeController.getCollegeStats);

// College settings
router.get('/settings', collegeController.getCollegeSettings);
router.put('/settings', collegeController.updateCollegeSettings);

// Academic calendar
router.get('/calendar', collegeController.getAcademicCalendar);
router.put('/calendar', collegeController.updateAcademicCalendar);

// College announcements
router.get('/announcements', collegeController.getAnnouncements);
router.post('/announcements', collegeController.createAnnouncement);
router.put('/announcements/:id', collegeController.updateAnnouncement);
router.delete('/announcements/:id', collegeController.deleteAnnouncement);

module.exports = router;