import express from 'express';
import { validateMessageInput, validatePagination } from '../middleware/validation.js';
import messageController from '../controller/message.controller.js';
import { protectedRoute } from '../middleware/auth.middleware.js';
import { messageRateLimit } from '../middleware/ratelimit.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protectedRoute);

// Routes for messages

// Send a new message
// POST /api/messages/send
router.post('/send', 
    messageRateLimit, // Rate limit message sending 
    validateMessageInput,
    messageController.sendMessage
);

// Get conversation messages with pagination
// GET /api/messages/conversation/:otherUserId?page=1&limit=50
router.get('/conversation/:otherUserId',
    validatePagination,
    messageController.getConversationMessages
);

// Mark messages as read
// PUT /api/messages/read/:otherUserId
router.put('/read/:otherUserId',
    messageController.markMessagesAsRead
);

// Get user's conversations list
// GET /api/messages/conversations
router.get('/conversations',
    messageController.getUserConversations
);

// Delete a message
// DELETE /api/messages/:messageId
router.delete('/:messageId',
    messageController.deleteMessage
);

// Get unread message count
// GET /api/messages/unread/count
router.get('/unread/count',
    messageController.getUnreadCount
);

// Search messages
// GET /api/messages/search?q=query&limit=20
router.get('/search',
    messageController.searchMessages
);

// Get online friends
// GET /api/messages/friends/online
router.get('/friends/online',
    messageController.getOnlineFriends
);

// Get conversation info
// GET /api/messages/conversation/:otherUserId/info
router.get('/conversation/:otherUserId/info',
    messageController.getConversationInfo
);

// Clear/hide a conversation
// PUT /api/messages/conversation/:otherUserId/clear
router.put('/conversation/:otherUserId/clear',
    messageController.clearConversation
);

export default router;