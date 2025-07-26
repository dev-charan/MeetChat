import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { cache } from '../config/redis.js';

// Socket authentication middleware
export const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return next(new Error('User not found'));
        }

        // Attach user to socket
        socket.userId = user._id.toString();
        socket.user = user;
        
        next();
    } catch (error) {
        next(new Error('Invalid authentication token'));
    }
};

// Rate limiting middleware for socket events
const rateLimitMap = new Map();

export const socketRateLimit = (maxRequests = 10, windowMs = 60000) => {
    return (socket, next) => {
        const userId = socket.userId;
        const now = Date.now();
        
        if (!rateLimitMap.has(userId)) {
            rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
            return next();
        }
        
        const userLimit = rateLimitMap.get(userId);
        
        if (now > userLimit.resetTime) {
            // Reset the limit
            rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
            return next();
        }
        
        if (userLimit.count >= maxRequests) {
            return next(new Error('Rate limit exceeded'));
        }
        
        userLimit.count++;
        next();
    };
};

// Main connection handler
export const handleConnection = (io) => {
    return async (socket) => {
        const userId = socket.userId;
        const user = socket.user;
        
        console.log(`✅ User connected: ${user.fullname} (${userId})`);
        
        // Set user online in Redis and join personal room
        await cache.setUserOnline(userId, socket.id);
        socket.join(`user_${userId}`);
        
        // Join conversation rooms for active conversations
        try {
            const conversations = await cache.getCachedUserConversations(userId);
            if (conversations) {
                conversations.forEach(conv => {
                    socket.join(`conversation_${conv.conversationId}`);
                });
            }
        } catch (error) {
            console.error('Error joining conversation rooms:', error);
        }
        
        // Broadcast online status to friends
        try {
            const userWithFriends = await User.findById(userId).populate('friends', '_id');
            const friendIds = userWithFriends.friends.map(friend => friend._id.toString());
            
            // Notify friends that user is online
            friendIds.forEach(friendId => {
                socket.to(`user_${friendId}`).emit('friend_online', {
                    userId: userId,
                    fullname: user.fullname,
                    profilePic: user.profilePic,
                    timestamp: new Date()
                });
            });
        } catch (error) {
            console.error('Error notifying friends about online status:', error);
        }
        
        // Handle user joining a conversation room
        socket.on('join_conversation', async (data) => {
            try {
                const { otherUserId } = data;
                
                // Verify they are friends
                const currentUser = await User.findById(userId);
                if (!currentUser.friends.includes(otherUserId)) {
                    socket.emit('error', { message: 'Can only chat with friends' });
                    return;
                }
                
                // Create conversation room ID
                const conversationId = [userId, otherUserId].sort().join('_');
                socket.join(`conversation_${conversationId}`);
                
                socket.emit('conversation_joined', { conversationId });
                
            } catch (error) {
                socket.emit('error', { message: 'Failed to join conversation' });
            }
        });
        
        // Handle leaving conversation room
        socket.on('leave_conversation', (data) => {
            const { conversationId } = data;
            socket.leave(`conversation_${conversationId}`);
            socket.emit('conversation_left', { conversationId });
        });
        
        // Handle typing indicators
        socket.on('typing_start', (data) => {
            const { conversationId } = data;
            socket.to(`conversation_${conversationId}`).emit('user_typing', {
                userId: userId,
                fullname: user.fullname,
                conversationId
            });
        });
        
        socket.on('typing_stop', (data) => {
            const { conversationId } = data;
            socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
                userId: userId,
                conversationId
            });
        });
        
        // Handle user going offline
        const handleDisconnect = async (reason) => {
            console.log(`❌ User disconnected: ${user.fullname} (${userId}) - Reason: ${reason}`);
            
            try {
                // Set user offline in Redis
                await cache.setUserOffline(userId);
                
                // Notify friends that user is offline
                const userWithFriends = await User.findById(userId).populate('friends', '_id');
                const friendIds = userWithFriends.friends.map(friend => friend._id.toString());
                
                friendIds.forEach(friendId => {
                    socket.to(`user_${friendId}`).emit('friend_offline', {
                        userId: userId,
                        fullname: user.fullname,
                        timestamp: new Date()
                    });
                });
                
            } catch (error) {
                console.error('Error handling disconnect:', error);
            }
        };
        
        // Handle disconnection
        socket.on('disconnect', handleDisconnect);
        
        // Handle manual logout
        socket.on('logout', async () => {
            await handleDisconnect('manual logout');
            socket.disconnect();
        });
        
        // Ping/Pong for connection health check
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: new Date() });
        });
        
        // Handle errors
        socket.on('error', (error) => {
            console.error(`Socket error for user ${userId}:`, error);
        });
    };
};

// Cleanup function for rate limit map
setInterval(() => {
    const now = Date.now();
    for (const [userId, limit] of rateLimitMap.entries()) {
        if (now > limit.resetTime) {
            rateLimitMap.delete(userId);
        }
    }
}, 60000); // Clean up every minute

export default {
    authenticateSocket,
    socketRateLimit,
    handleConnection
};