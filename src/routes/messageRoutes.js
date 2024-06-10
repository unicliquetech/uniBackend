const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Get messages for a particular user
router.get('/messages/:userId', messageController.getMessages);

router.get('/messages/sender/:senderId', messageController.getSenderMessages);

// Send a new message
router.post('/messages', messageController.sendMessage);

// Delete a message
router.delete('/messages/:messageId', messageController.deleteMessage);

// Mark a message as read or unread
router.patch('/messages/:messageId/read', messageController.markMessage);

// Archive or unarchive a message
router.patch('/messages/:messageId/archive', messageController.archiveMessage);

module.exports = router;