const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/parent/messageController');

// Message management
router.get('/', messageController.getMessages);
router.get('/:id', messageController.getMessageById);
router.post('/', messageController.sendMessage);
router.delete('/:id', messageController.deleteMessage);
router.put('/:id/read', messageController.markAsRead);

module.exports = router;