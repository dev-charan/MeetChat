import rateLimit from 'express-rate-limit';
import { cache } from '../lib/redis.js';

// General rate limiter for message endpoints
export const messageRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 messages per minute
    message: {
        success: false,
        message: 'Too many messages sent. Please wait before sending another message.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user._id.toString(); // Rate limit per user
    },
    skip: (req) => {
        // Skip rate limiting for admin users if needed
        return req.user.role === 'admin';
    }
});

// Stricter rate limit for message sending
export const sendMessageRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 messages per minute
    message: {
        success: false,
        message: 'You are sending messages too quickly. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user._id.toString();
    }
});

// Rate limit for search operations
export const searchRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // 10 searches per minute
    message: {
        success: false,
        message: 'Too many search requests. Please wait before searching again.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user._id.toString();
    }
});

// Custom Redis-based rate limiter for more control
export const redisRateLimit = (maxRequests, windowMs, keyPrefix = 'rate_limit') => {
    return async (req, res, next) => {
        try {
            const userId = req.user._id.toString();
            const key = `${keyPrefix}:${userId}`;
            const now = Date.now();
            const window = Math.floor(now / windowMs);
            const windowKey = `${key}:${window}`;

            // Get current count
            const currentCount = await cache.get(windowKey) || 0;

            if (currentCount >= maxRequests) {
                return res.status(429).json({
                    success: false,
                    message: 'Rate limit exceeded. Please try again later.',
                    retryAfter: Math.ceil(windowMs / 1000)
                });
            }

            // Increment count
            await cache.set(windowKey, currentCount + 1, Math.ceil(windowMs / 1000));

            // Set headers
            res.set({
                'X-RateLimit-Limit': maxRequests,
                'X-RateLimit-Remaining': Math.max(0, maxRequests - currentCount - 1),
                'X-RateLimit-Reset': Math.ceil((window + 1) * windowMs / 1000)
            });

            next();
        } catch (error) {
            console.error('Rate limit error:', error);
            // Continue without rate limiting if Redis fails
            next();
        }
    };
};

// Anti-spam middleware for message content
export const antiSpamMiddleware = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const content = req.body.content?.trim().toLowerCase();
        
        if (!content) {
            return next();
        }

        // Check for duplicate messages in short time frame
        const duplicateKey = `spam_check:${userId}:${Buffer.from(content).toString('base64')}`;
        const isDuplicate = await cache.exists(duplicateKey);

        if (isDuplicate) {
            return res.status(429).json({
                success: false,
                message: 'Duplicate message detected. Please wait before sending the same message again.'
            });
        }

        // Store message hash for 30 seconds
        await cache.set(duplicateKey, true, 30);

        // Check for rapid identical messages
        const rapidSpamKey = `rapid_spam:${userId}`;
        const recentMessages = await cache.get(rapidSpamKey) || [];
        
        // Add current message timestamp
        const now = Date.now();
        recentMessages.push(now);
        
        // Keep only messages from last 60 seconds
        const filtered = recentMessages.filter(timestamp => now - timestamp < 60000);
        
        // Check if user sent more than 5 messages in last 60 seconds
        if (filtered.length > 5) {
            return res.status(429).json({
                success: false,
                message: 'You are sending messages too quickly. Please slow down.'
            });
        }

        // Update cache
        await cache.set(rapidSpamKey, filtered, 60);

        next();
    } catch (error) {
        console.error('Anti-spam middleware error:', error);
        // Continue without anti-spam if Redis fails
        next();
    }
};

// IP-based rate limiting for additional protection
export const ipRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per 15 minutes per IP
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

export default {
    messageRateLimit,
    sendMessageRateLimit,
    searchRateLimit,
    redisRateLimit,
    antiSpamMiddleware,
    ipRateLimit
};