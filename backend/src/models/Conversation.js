import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    // Track unread count for each participant
    unreadCount: {
        type: Map,
        of: Number,
        default: new Map()
    },
    // Track if conversation is active for each participant
    isActive: {
        type: Map,
        of: Boolean,
        default: new Map()
    }
}, {
    timestamps: true
});

// Ensure only 2 participants for direct messages
conversationSchema.pre('save', function(next) {
    if (this.participants.length !== 2) {
        next(new Error('Direct message conversation must have exactly 2 participants'));
    } else {
        next();
    }
});

// Index for faster queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastActivity: -1 });

// Static method to find conversation between two users
conversationSchema.statics.findBetweenUsers = function(userId1, userId2) {
    return this.findOne({
        participants: { $all: [userId1, userId2] }
    });
};

// Method to get conversation ID (useful for socket rooms)
conversationSchema.methods.getConversationId = function() {
    return this.participants.map(p => p.toString()).sort().join('_');
};

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;