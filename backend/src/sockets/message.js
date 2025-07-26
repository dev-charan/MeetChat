import { cache } from '../lib/redis.js';
import messageService  from '../services/messageServices.js';

// Message socket event handlers
export const handleMessageEvents = (io, socket) => {
    const userId = socket.userId;
    const user = socket.user;

    // Send a direct message
    socket.on('dm:send', async (data) => {
        try {
            const { recipientId, content, messageType = 'text', fileData = {} } = data;

            // Validate input
            if (!recipientId || !content?.trim()) {
                socket.emit('dm:error', { 
                    message: 'Recipient ID and content are required',
                    event: 'dm:send'
                });
                return;
            }

            // Send message using service
            const result = await messageService.sendMessage(
                userId, 
                recipientId, 
                content.trim(), 
                messageType, 
                fileData
            );

            const { message, conversationId } = result;

            // Emit to sender (confirmation)
            socket.emit('dm:sent', {
                message,
                conversationId,
                timestamp: new Date()
            });

            // Emit to recipient if online
            const isRecipientOnline = await cache.isUserOnline(recipientId);
            if (isRecipientOnline) {
                socket.to(`conversation_${conversationId}`).emit('dm:received', {
                    message,
                    conversationId,
                    timestamp: new Date()
                });

                // Also send to recipient's personal room for notifications
                socket.to(`user_${recipientId}`).emit('new_message_notification', {
                    sender: {
                        _id: user._id,
                        fullname: user.fullname,
                        profilePic: user.profilePic
                    },
                    message: {
                        _id: message._id,
                        content: message.content,
                        messageType: message.messageType,
                        createdAt: message.createdAt
                    },
                    conversationId
                });
            }

        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('dm:error', { 
                message: error.message,
                event: 'dm:send'
            });
        }
    });

    // Mark messages as seen/read
    socket.on('dm:seen', async (data) => {
        try {
            const { otherUserId } = data;

            if (!otherUserId) {
                socket.emit('dm:error', { 
                    message: 'Other user ID is required',
                    event: 'dm:seen'
                });
                return;
            }

            // Mark messages as read
            await messageService.markMessagesAsRead(userId, otherUserId);

            const conversationId = [userId, otherUserId].sort().join('_');

            // Confirm to the user who marked as read
            socket.emit('dm:seen_confirmed', {
                otherUserId,
                conversationId,
                timestamp: new Date()
            });

            // Notify the sender that their messages were read
            socket.to(`conversation_${conversationId}`).emit('dm:read_receipt', {
                readBy: userId,
                readByName: user.fullname,
                conversationId,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error marking messages as seen:', error);
            socket.emit('dm:error', { 
                message: error.message,
                event: 'dm:seen'
            });
        }
    });

    // Delete a message
    socket.on('dm:delete', async (data) => {
        try {
            const { messageId } = data;

            if (!messageId) {
                socket.emit('dm:error', { 
                    message: 'Message ID is required',
                    event: 'dm:delete'
                });
                return;
            }

            // Delete message using service
            const deletedMessage = await messageService.deleteMessage(userId, messageId);
            
            const conversationId = [deletedMessage.sender.toString(), deletedMessage.recipient.toString()].sort().join('_');

            // Confirm deletion to sender
            socket.emit('dm:deleted', {
                messageId,
                conversationId,
                timestamp: new Date()
            });

            // Notify other participant about deletion
            socket.to(`conversation_${conversationId}`).emit('dm:message_deleted', {
                messageId,
                deletedBy: userId,
                conversationId,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error deleting message:', error);
            socket.emit('dm:error', { 
                message: error.message,
                event: 'dm:delete'
            });
        }
    });

    // Get conversation messages
    socket.on('dm:get_messages', async (data) => {
        try {
            const { otherUserId, page = 1, limit = 50 } = data;

            if (!otherUserId) {
                socket.emit('dm:error', { 
                    message: 'Other user ID is required',
                    event: 'dm:get_messages'
                });
                return;
            }

            // Get messages using service
            const messages = await messageService.getConversationMessages(
                userId, 
                otherUserId, 
                page, 
                limit
            );

            socket.emit('dm:messages_loaded', {
                otherUserId,
                messages,
                page,
                hasMore: messages.length === limit,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error loading messages:', error);
            socket.emit('dm:error', { 
                message: error.message,
                event: 'dm:get_messages'
            });
        }
    });

    // Get user's conversations list
    socket.on('conversations:get', async () => {
        try {
            const conversations = await messageService.getUserConversations(userId);

            socket.emit('conversations:loaded', {
                conversations,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error loading conversations:', error);
            socket.emit('conversations:error', { 
                message: error.message 
            });
        }
    });

    // Get unread message count
    socket.on('unread:get_count', async () => {
        try {
            const unreadCount = await messageService.getUnreadCount(userId);

            socket.emit('unread:count', {
                count: unreadCount,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error getting unread count:', error);
            socket.emit('unread:error', { 
                message: error.message 
            });
        }
    });

    // Search messages
    socket.on('messages:search', async (data) => {
        try {
            const { query, limit = 20 } = data;

            if (!query?.trim()) {
                socket.emit('messages:search_error', { 
                    message: 'Search query is required' 
                });
                return;
            }

            const results = await messageService.searchMessages(userId, query.trim(), limit);

            socket.emit('messages:search_results', {
                query,
                results,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error searching messages:', error);
            socket.emit('messages:search_error', { 
                message: error.message 
            });
        }
    });

    // Handle connection to conversation room with message loading
    socket.on('conversation:join_and_load', async (data) => {
        try {
            const { otherUserId, page = 1, limit = 50 } = data;

            if (!otherUserId) {
                socket.emit('conversation:error', { 
                    message: 'Other user ID is required' 
                });
                return;
            }

            // Join conversation room
            const conversationId = [userId, otherUserId].sort().join('_');
            socket.join(`conversation_${conversationId}`);

            // Load messages
            const messages = await messageService.getConversationMessages(
                userId, 
                otherUserId, 
                page, 
                limit
            );

            // Mark messages as read
            await messageService.markMessagesAsRead(userId, otherUserId);

            socket.emit('conversation:joined_and_loaded', {
                conversationId,
                otherUserId,
                messages,
                page,
                hasMore: messages.length === limit,
                timestamp: new Date()
            });

            // Notify other user about read receipt
            socket.to(`conversation_${conversationId}`).emit('dm:read_receipt', {
                readBy: userId,
                readByName: user.fullname,
                conversationId,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error joining conversation and loading messages:', error);
            socket.emit('conversation:error', { 
                message: error.message 
            });
        }
    });
};

export default handleMessageEvents;