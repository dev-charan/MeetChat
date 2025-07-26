import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    messageType: {
        type: String,
        enum: ["text", "image", "file"],
        default: "text"
    },
    fileUrl: {
        type: String,
        default: ""
    },
    fileName: {
        type: String,
        default: ""
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
    editedAt: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });

// Virtual for conversation participants (useful for querying)
messageSchema.virtual('conversationId').get(function() {
    return [this.sender.toString(), this.recipient.toString()].sort().join('_');
});

const Message = mongoose.model("Message", messageSchema);

export default Message;