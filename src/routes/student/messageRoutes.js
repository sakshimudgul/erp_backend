const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/student/messageController');

// Message management
router.get('/', messageController.getMessages);
router.get('/:id', messageController.getMessageById);
router.post('/', messageController.sendMessage);
router.delete('/:id', messageController.deleteMessage);
router.put('/:id/read', messageController.markAsRead);

// Message threads
router.get('/threads', messageController.getMessageThreads);

module.exports = router;