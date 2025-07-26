import Redis from 'ioredis';

// Redis configuration
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
    family: 4, // 4 (IPv4) or 6 (IPv6)
    connectTimeout: 10000,
    commandTimeout: 5000,
};

// Main Redis client for caching
const redisClient = new Redis(redisConfig);

// Redis client for Socket.io adapter (pub/sub)
const redisPubClient = new Redis(redisConfig);
const redisSubClient = new Redis(redisConfig);

// Error handling
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('✅ Redis client connected');
});

redisPubClient.on('error', (err) => {
    console.error('Redis Pub Client Error:', err);
});

redisSubClient.on('error', (err) => {
    console.error('Redis Sub Client Error:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    await redisClient.quit();
    await redisPubClient.quit();
    await redisSubClient.quit();
});

// Cache helper functions
export const cache = {
    // Set cache with expiration (default 1 hour)
    set: async (key, value, ttl = 3600) => {
        try {
            await redisClient.setex(key, ttl, JSON.stringify(value));
        } catch (error) {
            console.error('Cache set error:', error);
        }
    },

    // Get from cache
    get: async (key) => {
        try {
            const value = await redisClient.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    },

    // Delete from cache
    del: async (key) => {
        try {
            await redisClient.del(key);
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    },

    // Check if key exists
    exists: async (key) => {
        try {
            return await redisClient.exists(key);
        } catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    },

    // Set user online status
    setUserOnline: async (userId, socketId) => {
        try {
            await redisClient.hset('online_users', userId.toString(), socketId);
            await redisClient.setex(`user_last_seen:${userId}`, 300, Date.now()); // 5 min TTL
        } catch (error) {
            console.error('Set user online error:', error);
        }
    },

    // Remove user online status
    setUserOffline: async (userId) => {
        try {
            await redisClient.hdel('online_users', userId.toString());
            await redisClient.setex(`user_last_seen:${userId}`, 86400, Date.now()); // 24 hour TTL
        } catch (error) {
            console.error('Set user offline error:', error);
        }
    },

    // Check if user is online
    isUserOnline: async (userId) => {
        try {
            return await redisClient.hexists('online_users', userId.toString());
        } catch (error) {
            console.error('Check user online error:', error);
            return false;
        }
    },

    // Get all online users
    getOnlineUsers: async () => {
        try {
            return await redisClient.hgetall('online_users');
        } catch (error) {
            console.error('Get online users error:', error);
            return {};
        }
    },

    // Cache user's conversations list
    cacheUserConversations: async (userId, conversations) => {
        await cache.set(`user_conversations:${userId}`, conversations, 1800); // 30 min
    },

    // Get cached conversations
    getCachedUserConversations: async (userId) => {
        return await cache.get(`user_conversations:${userId}`);
    },

    // Clear user conversation cache
    clearUserConversationsCache: async (userId) => {
        await cache.del(`user_conversations:${userId}`);
    }
};

export { redisClient, redisPubClient, redisSubClient };
export default redisClient;