const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/faculty/messageController');

// Message management
router.get('/', messageController.getMessages);
router.get('/:id', messageController.getMessageById);
router.post('/', messageController.sendMessage);
router.delete('/:id', messageController.deleteMessage);
router.put('/:id/read', messageController.markAsRead);

// Group messages
router.post('/group', messageController.sendGroupMessage);

// Message threads
router.get('/threads', messageController.getMessageThreads);
router.get('/threads/:id', messageController.getThreadDetails);

module.exports = router;