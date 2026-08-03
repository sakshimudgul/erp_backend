const express = require('express');
const router = express.Router();
const idController = require('../../controllers/receptionist/idController');

// ID card management
router.get('/', idController.getIdCards);
router.post('/', idController.createIdCard);
router.get('/:id', idController.getIdCard);
router.put('/:id', idController.updateIdCard);
router.delete('/:id', idController.deleteIdCard);

// ID card generation
router.post('/generate', idController.generateIdCards);
router.get('/print/:id', idController.printIdCard);

module.exports = router;const express = require('express');
const router = express.Router();
const idController = require('../../controllers/receptionist/idController');

// ID card management
router.get('/', idController.getIdCards);
router.post('/', idController.createIdCard);
router.get('/:id', idController.getIdCard);
router.put('/:id', idController.updateIdCard);
router.delete('/:id', idController.deleteIdCard);

// ID card generation
router.post('/generate', idController.generateIdCards);
router.get('/print/:id', idController.printIdCard);

module.exports = router;