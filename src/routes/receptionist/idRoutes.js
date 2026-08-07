const express = require('express');
const router = express.Router();
const idController = require('../../controllers/receptionist/idController');
const auth = require('../../middleware/auth');
const { isReceptionist } = require('../../middleware/roleCheck');

// All routes require authentication and Receptionist role
router.use(auth);
router.use(isReceptionist);

// ID card management routes
router.get('/', idController.getIdCards);
router.post('/', idController.createIdCard);
router.get('/:id', idController.getIdCard);
router.put('/:id', idController.updateIdCard);
router.delete('/:id', idController.deleteIdCard);

// ID card generation
router.post('/generate', idController.generateIdCards);
router.get('/print/:id', idController.printIdCard);

module.exports = router;