import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import { cache } from '../lib/redis.js';
import Message from '../models/Massage.js';

class MessageService {
    // Send a new message
    async sendMessage(senderId, recipientId, content, messageType = 'text', fileData = {}) {
        try {
            // Check if users are friends
            const sender = await User.findById(senderId);
            if (!sender.friends.includes(recipientId)) {
                throw new Error('Can only send messages to friends');
            }

            // Create the message
            const message = new Message({
                sender: senderId,
                recipient: recipientId,
                content,
                messageType,
                fileUrl: fileData.fileUrl || '',
                fileName: fileData.fileName || ''
            });

            await message.save();

            // Find or create conversation
            let conversation = await Conversation.findBetweenUsers(senderId, recipientId);
            
            if (!conversation) {
                conversation = new Conversation({
                    participants: [senderId, recipientId],
                    lastMessage: message._id,
                    lastActivity: new Date()
                });
                
                // Initialize unread count and active status
                conversation.unreadCount.set(senderId.toString(), 0);
                conversation.unreadCount.set(recipientId.toString(), 1);
                conversation.isActive.set(senderId.toString(), true);
                conversation.isActive.set(recipientId.toString(), true);
            } else {
                // Update existing conversation
                conversation.lastMessage = message._id;
                conversation.lastActivity = new Date();
                
                // Increment unread count for recipient
                const currentUnread = conversation.unreadCount.get(recipientId.toString()) || 0;
                conversation.unreadCount.set(recipientId.toString(), currentUnread + 1);
            }

            await conversation.save();

            // Clear cached conversations for both users
            await cache.clearUserConversationsCache(senderId);
            await cache.clearUserConversationsCache(recipientId);

            // Populate message with sender info for real-time emission
            await message.populate('sender', 'fullname profilePic');

            return {
                message,
                conversationId: conversation.getConversationId()
            };

        } catch (error) {
            throw new Error(`Failed to send message: ${error.message}`);
        }
    }

    // Get conversation messages with pagination
    async getConversationMessages(userId, otherUserId, page = 1, limit = 50) {
        try {
            const skip = (page - 1) * limit;

            const messages = await Message.find({
                $or: [
                    { sender: userId, recipient: otherUserId },
                    { sender: otherUserId, recipient: userId }
                ],
                isDeleted: false
            })
            .populate('sender', 'fullname profilePic')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

            return messages.reverse(); // Return in chronological order
        } catch (error) {
            throw new Error(`Failed to get messages: ${error.message}`);
        }
    }

    // Mark messages as read
    async markMessagesAsRead(userId, otherUserId) {
        try {
            // Update messages
            await Message.updateMany(
                {
                    sender: otherUserId,
                    recipient: userId,
                    isRead: false
                },
                {
                    $set: {
                        isRead: true,
                        readAt: new Date()
                    }
                }
            );

            // Update conversation unread count
            const conversation = await Conversation.findBetweenUsers(userId, otherUserId);
            if (conversation) {
                conversation.unreadCount.set(userId.toString(), 0);
                await conversation.save();
                
                // Clear cache
                await cache.clearUserConversationsCache(userId);
            }

            return true;
        } catch (error) {
            throw new Error(`Failed to mark messages as read: ${error.message}`);
        }
    }

    // Get user's conversations with last message and unread count
    async getUserConversations(userId) {
        try {
            // Try to get from cache first
            const cached = await cache.getCachedUserConversations(userId);
            if (cached) {
                return cached;
            }

            const conversations = await Conversation.find({
                participants: userId,
                'isActive.userId': true
            })
            .populate('participants', 'fullname profilePic')
            .populate('lastMessage')
            .sort({ lastActivity: -1 });

            // Format conversations for frontend
            const formattedConversations = conversations.map(conv => {
                const otherUser = conv.participants.find(p => p._id.toString() !== userId.toString());
                const unreadCount = conv.unreadCount.get(userId.toString()) || 0;

                return {
                    conversationId: conv.getConversationId(),
                    otherUser: {
                        _id: otherUser._id,
                        fullname: otherUser.fullname,
                        profilePic: otherUser.profilePic
                    },
                    lastMessage: conv.lastMessage,
                    lastActivity: conv.lastActivity,
                    unreadCount
                };
            });

            // Cache the result
            await cache.cacheUserConversations(userId, formattedConversations);

            return formattedConversations;
        } catch (error) {
            throw new Error(`Failed to get conversations: ${error.message}`);
        }
    }

    // Delete a message (soft delete)
    async deleteMessage(userId, messageId) {
        try {
            const message = await Message.findOne({
                _id: messageId,
                sender: userId,
                isDeleted: false
            });

            if (!message) {
                throw new Error('Message not found or not authorized');
            }

            message.isDeleted = true;
            message.deletedAt = new Date();
            await message.save();

            // Clear cache for both users
            await cache.clearUserConversationsCache(message.sender);
            await cache.clearUserConversationsCache(message.recipient);

            return message;
        } catch (error) {
            throw new Error(`Failed to delete message: ${error.message}`);
        }
    }

    // Get unread message count for user
    async getUnreadCount(userId) {
        try {
            const count = await Message.countDocuments({
                recipient: userId,
                isRead: false,
                isDeleted: false
            });

            return count;
        } catch (error) {
            throw new Error(`Failed to get unread count: ${error.message}`);
        }
    }

    // Search messages
    async searchMessages(userId, query, limit = 20) {
        try {
            const messages = await Message.find({
                $or: [
                    { sender: userId },
                    { recipient: userId }
                ],
                content: { $regex: query, $options: 'i' },
                isDeleted: false
            })
            .populate('sender', 'fullname profilePic')
            .populate('recipient', 'fullname profilePic')
            .sort({ createdAt: -1 })
            .limit(limit);

            return messages;
        } catch (error) {
            throw new Error(`Failed to search messages: ${error.message}`);
        }
    }
}

export default new MessageService();