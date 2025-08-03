import React, { useRef, useEffect, useState } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import { useSelector } from "react-redux";
import { useSocket } from "../../context/SocketProvider";
import { fetchMessages } from "../../lib/messageapi"; // REST fetch
// We'll skip React Query here; just plain fetch for initial load

const MessageChat = () => {
  const socket = useSocket();
  const selectedContactId = useSelector((s) => s.chat.selectedContactId);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Load chat history on contact select
  useEffect(() => {
    if (!selectedContactId || !socket) {
      setMessages([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    fetchMessages(selectedContactId)
      .then((res) => {
        setMessages(res.data.data.messages || []);
        setIsLoading(false);
        // After initial load: join room & mark messages as read
        socket.emit("conversation:join_and_load", {
          otherUserId: selectedContactId,
        });
        socket.emit("dm:seen", { otherUserId: selectedContactId });
      })
      .catch((err) => {
        setError("Failed to load messages");
        setIsLoading(false);
      });

    // Subscribe to socket events
    function handleIncoming(data) {
      // Only append if this chat is open (prevent from showing in wrong chat)
      if (
        data.conversationId ===
          [socket.userId, selectedContactId].sort().join("_") ||
        data.message.sender === selectedContactId ||
        data.message.recipient === selectedContactId
      ) {
        setMessages((prev) => [...prev, data.message]);
      }
    }
    function handleOwnSent(data) {
      setMessages((prev) => [...prev, data.message]);
    }

    socket.on("dm:received", handleIncoming);
    socket.on("dm:sent", handleOwnSent);

    return () => {
      socket.off("dm:received", handleIncoming);
      socket.off("dm:sent", handleOwnSent);
    };
  }, [selectedContactId, socket]);

  // Scroll to new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message via socket
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContactId) return;
    socket.emit("dm:send", {
      recipientId: selectedContactId,
      content: newMessage.trim(),
      messageType: "text",
    });
    setNewMessage("");
  };

  // Handle optimistic UI and loading/error
  if (!selectedContactId) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-200">
            <Smile className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium">Select a contact</p>
          <p className="text-sm">Choose someone to start chatting with</p>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading conversation...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-red-500">Error loading messages</div>
      </div>
    );
  }

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  const renderMessageContent = (message) => {
    switch (message.messageType) {
      case "image":
        return (
          <img
            src={message.fileUrl}
            alt="Shared"
            className="rounded-lg w-full h-auto object-cover max-w-xs"
          />
        );
      case "file":
        return (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg max-w-xs">
            <Paperclip className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {message.fileName || "File"}
              </p>
              <p className="text-xs text-gray-500">File</p>
            </div>
          </div>
        );
      default:
        return <p className="text-sm">{message.content}</p>;
    }
  };

  // Use local userId if you want to highlight "own" messages
  const userId = socket?.userId;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smile className="w-8 h-8 text-gray-400" />
              </div>
              <p>No messages yet</p>
              <p className="text-sm">Start a conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message, idx) => (
            <div
              key={message._id || idx}
              className={`flex ${
                message.sender === userId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-end gap-2 max-w-xs lg:max-w-md ${
                  message.sender === userId ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <img
                  src={
                    message.senderProfilePic ||
                    "https://avatar.iran.liara.run/public/1.png"
                  }
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  onError={(e) => {
                    e.target.src = "https://avatar.iran.liara.run/public/1.png";
                  }}
                />
                <div className="flex flex-col">
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      message.sender === userId
                        ? "bg-blue-500 text-white rounded-br-sm"
                        : "rounded-bl-sm border border-gray-200"
                    }`}
                  >
                    {renderMessageContent(message)}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 px-2">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex-shrink-0 p-4 border-t border-gray-200 ">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <button type="button" className="p-2 text-gray-500" disabled>
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full"
          />
          <button type="button" className="p-2 text-gray-500" disabled>
            <Smile className="w-5 h-5" />
          </button>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageChat;
