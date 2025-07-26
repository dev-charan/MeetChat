import messageServices from '../services/messageServices.js';
import { cache } from '../lib/redis.js';
class MessageController {
    // Send a new message (REST endpoint)
    async sendMessage(req, res) {
        try {
            const { recipientId, content, messageType = 'text' } = req.body;
            const senderId = req.user._id;

            // Validate input
            if (!recipientId || !content?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Recipient ID and content are required'
                });
            }

            // Handle file data if present
            const fileData = {
                fileUrl: req.body.fileUrl || '',
                fileName: req.body.fileName || ''
            };

            const result = await messageServices.sendMessage(
                senderId,
                recipientId,
                content.trim(),
                messageType,
                fileData
            );

            res.status(201).json({
                success: true,
                message: 'Message sent successfully',
                data: result
            });

        } catch (error) {
            console.error('Send message error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get conversation messages with pagination
    async getConversationMessages(req, res) {
        try {
            const { otherUserId } = req.params;
            const { page = 1, limit = 50 } = req.query;
            const userId = req.user._id;

            if (!otherUserId) {
                return res.status(400).json({
                    success: false,
                    message: 'Other user ID is required'
                });
            }

            const messages = await messageServices.getConversationMessages(
                userId,
                otherUserId,
                parseInt(page),
                parseInt(limit)
            );

            res.status(200).json({
                success: true,
                data: {
                    messages,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        hasMore: messages.length === parseInt(limit)
                    }
                }
            });

        } catch (error) {
            console.error('Get messages error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Mark messages as read
    async markMessagesAsRead(req, res) {
        try {
            const { otherUserId } = req.params;
            const userId = req.user._id;

            if (!otherUserId) {
                return res.status(400).json({
                    success: false,
                    message: 'Other user ID is required'
                });
            }

            await messageServices.markMessagesAsRead(userId, otherUserId);

            res.status(200).json({
                success: true,
                message: 'Messages marked as read'
            });

        } catch (error) {
            console.error('Mark as read error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get user's conversations
    async getUserConversations(req, res) {
        try {
            const userId = req.user._id;
            const conversations = await messageServices.getUserConversations(userId);

            res.status(200).json({
                success: true,
                data: conversations
            });

        } catch (error) {
            console.error('Get conversations error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Delete a message
    async deleteMessage(req, res) {
        try {
            const { messageId } = req.params;
            const userId = req.user._id;

            if (!messageId) {
                return res.status(400).json({
                    success: false,
                    message: 'Message ID is required'
                });
            }

            const deletedMessage = await messageServices.deleteMessage(userId, messageId);

            res.status(200).json({
                success: true,
                message: 'Message deleted successfully',
                data: deletedMessage
            });

        } catch (error) {
            console.error('Delete message error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get unread message count
    async getUnreadCount(req, res) {
        try {
            const userId = req.user._id;
            const count = await messageServices.getUnreadCount(userId);

            res.status(200).json({
                success: true,
                data: { unreadCount: count }
            });

        } catch (error) {
            console.error('Get unread count error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Search messages
    async searchMessages(req, res) {
        try {
            const { q: query, limit = 20 } = req.query;
            const userId = req.user._id;

            if (!query?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            const results = await messageServices.searchMessages(
                userId,
                query.trim(),
                parseInt(limit)
            );

            res.status(200).json({
                success: true,
                data: {
                    query: query.trim(),
                    results,
                    count: results.length
                }
            });

        } catch (error) {
            console.error('Search messages error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get online friends
    async getOnlineFriends(req, res) {
        try {
            const userId = req.user._id;
            const user = req.user;

            // Get user's friends
            const userWithFriends = await user.populate('friends', 'fullname profilePic');
            const friends = userWithFriends.friends;

            // Check which friends are online
            const onlineFriends = [];
            const onlineUsers = await cache.getOnlineUsers();

            for (const friend of friends) {
                const friendId = friend._id.toString();
                if (onlineUsers[friendId]) {
                    onlineFriends.push({
                        _id: friend._id,
                        fullname: friend.fullname,
                        profilePic: friend.profilePic,
                        isOnline: true
                    });
                }
            }

            res.status(200).json({
                success: true,
                data: onlineFriends
            });

        } catch (error) {
            console.error('Get online friends error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get conversation info
    async getConversationInfo(req, res) {
        try {
            const { otherUserId } = req.params;
            const userId = req.user._id;

            if (!otherUserId) {
                return res.status(400).json({
                    success: false,
                    message: 'Other user ID is required'
                });
            }

            // Get other user info
            const otherUser = await User.findById(otherUserId).select('fullname profilePic bio location');
            if (!otherUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if they are friends
            const currentUser = req.user;
            const areFriends = currentUser.friends.includes(otherUserId);

            // Check if other user is online
            const isOnline = await cache.isUserOnline(otherUserId);

            // Get conversation stats
            const conversationId = [userId.toString(), otherUserId].sort().join('_');
            const conversation = await Conversation.findOne({
                participants: { $all: [userId, otherUserId] }
            });

            const unreadCount = conversation 
                ? conversation.unreadCount.get(userId.toString()) || 0 
                : 0;

            res.status(200).json({
                success: true,
                data: {
                    otherUser: {
                        _id: otherUser._id,
                        fullname: otherUser.fullname,
                        profilePic: otherUser.profilePic,
                        bio: otherUser.bio,
                        location: otherUser.location,
                        isOnline
                    },
                    conversationId,
                    areFriends,
                    unreadCount,
                    lastActivity: conversation?.lastActivity || null
                }
            });

        } catch (error) {
            console.error('Get conversation info error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Clear conversation (mark as inactive)
    async clearConversation(req, res) {
        try {
            const { otherUserId } = req.params;
            const userId = req.user._id;

            if (!otherUserId) {
                return res.status(400).json({
                    success: false,
                    message: 'Other user ID is required'
                });
            }

            const conversation = await Conversation.findOne({
                participants: { $all: [userId, otherUserId] }
            });

            if (conversation) {
                conversation.isActive.set(userId.toString(), false);
                conversation.unreadCount.set(userId.toString(), 0);
                await conversation.save();

                // Clear cache
                await cache.clearUserConversationsCache(userId);
            }

            res.status(200).json({
                success: true,
                message: 'Conversation cleared successfully'
            });

        } catch (error) {
            console.error('Clear conversation error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

export default new MessageController();