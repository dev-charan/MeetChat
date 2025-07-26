import mongoose from 'mongoose';

// Validate message input
export const validateMessageInput = (req, res, next) => {
    const { recipientId, content, messageType } = req.body;

    // Check required fields
    if (!recipientId) {
        return res.status(400).json({
            success: false,
            message: 'Recipient ID is required'
        });
    }

    if (!content || !content.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Message content is required'
        });
    }

    // Validate recipient ID format
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid recipient ID format'
        });
    }

    // Check if user is trying to send message to themselves
    if (recipientId === req.user._id.toString()) {
        return res.status(400).json({
            success: false,
            message: 'Cannot send message to yourself'
        });
    }

    // Validate content length
    if (content.trim().length > 2000) {
        return res.status(400).json({
            success: false,
            message: 'Message content too long (max 2000 characters)'
        });
    }

    // Validate message type
    const validMessageTypes = ['text', 'image', 'file'];
    if (messageType && !validMessageTypes.includes(messageType)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid message type'
        });
    }

    // If file type, validate file data
    if (messageType === 'image' || messageType === 'file') {
        const { fileUrl, fileName } = req.body;
        
        if (!fileUrl || !fileName) {
            return res.status(400).json({
                success: false,
                message: 'File URL and filename are required for file messages'
            });
        }

        // Basic URL validation
        try {
            new URL(fileUrl);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file URL format'
            });
        }
    }

    next();
};

// Validate pagination parameters
export const validatePagination = (req, res, next) => {
    let { page = 1, limit = 50 } = req.query;

    // Convert to numbers
    page = parseInt(page);
    limit = parseInt(limit);

    // Validate page
    if (isNaN(page) || page < 1) {
        return res.status(400).json({
            success: false,
            message: 'Page must be a positive integer'
        });
    }

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({
            success: false,
            message: 'Limit must be between 1 and 100'
        });
    }

    // Set validated values back to query
    req.query.page = page;
    req.query.limit = limit;

    next();
};

// Validate ObjectId parameter
export const validateObjectId = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];

        if (!id) {
            return res.status(400).json({
                success: false,
                message: `${paramName} is required`
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: `Invalid ${paramName} format`
            });
        }

        next();
    };
};

// Validate search query
export const validateSearchQuery = (req, res, next) => {
    const { q: query, limit = 20 } = req.query;

    if (!query || !query.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Search query is required'
        });
    }

    if (query.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Search query must be at least 2 characters long'
        });
    }

    if (query.trim().length > 100) {
        return res.status(400).json({
            success: false,
            message: 'Search query too long (max 100 characters)'
        });
    }

    // Validate limit
    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
        return res.status(400).json({
            success: false,
            message: 'Limit must be between 1 and 50'
        });
    }

    req.query.limit = parsedLimit;
    next();
};

// Sanitize message content
export const sanitizeMessageContent = (req, res, next) => {
    if (req.body.content) {
        // Trim whitespace
        req.body.content = req.body.content.trim();
        
        // Remove potential XSS attempts (basic sanitization)
        req.body.content = req.body.content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    }

    next();
};

export default {
    validateMessageInput,
    validatePagination,
    validateObjectId,
    validateSearchQuery,
    sanitizeMessageContent
};