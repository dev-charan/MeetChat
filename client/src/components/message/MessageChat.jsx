import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

const MessageChat = ({ selectedContactId }) => {
  const messagesEndRef = useRef(null);
  
  // Sample message data - in real app, this would be filtered by selectedContactId
  const [messages, setMessages] = useState([
    {
      id: 1,
      senderId: 1,
      receiverId: 2,
      text: "Hey! How are you doing?",
      timestamp: "2024-01-15T10:30:00Z",
      type: "text",
      isOwn: false
    },
    {
      id: 2,
      senderId: 2,
      receiverId: 1,
      text: "I'm doing great! Just finished my morning workout. How about you?",
      timestamp: "2024-01-15T10:32:00Z",
      type: "text",
      isOwn: true
    },
    {
      id: 3,
      senderId: 1,
      receiverId: 2,
      text: "That's awesome! I'm just getting started with my day.",
      timestamp: "2024-01-15T10:35:00Z",
      type: "text",
      isOwn: false
    },
    {
      id: 4,
      senderId: 2,
      receiverId: 1,
      text: "https://picsum.photos/300/200?random=1",
      timestamp: "2024-01-15T10:40:00Z",
      type: "image",
      isOwn: true
    },
    {
      id: 5,
      senderId: 1,
      receiverId: 2,
      text: "Nice photo! Where was this taken?",
      timestamp: "2024-01-15T10:42:00Z",
      type: "text",
      isOwn: false
    },
    {
      id: 6,
      senderId: 2,
      receiverId: 1,
      text: "That's from my hike last weekend. The weather was perfect!",
      timestamp: "2024-01-15T10:45:00Z",
      type: "text",
      isOwn: true
    },
    {
      id: 7,
      senderId: 1,
      receiverId: 2,
      text: "I need to get out more often. Any recommendations for good hiking spots?",
      timestamp: "2024-01-15T10:47:00Z",
      type: "text",
      isOwn: false
    },
    {
      id: 8,
      senderId: 2,
      receiverId: 1,
      text: "Absolutely! I know several great trails. Let me send you a list.",
      timestamp: "2024-01-15T10:50:00Z",
      type: "text",
      isOwn: true
    },
    {
      id: 9,
      senderId: 1,
      receiverId: 2,
      text: "That would be amazing, thank you!",
      timestamp: "2024-01-15T10:52:00Z",
      type: "text",
      isOwn: false
    },
    {
      id: 10,
      senderId: 2,
      receiverId: 1,
      text: "Document.pdf",
      timestamp: "2024-01-15T10:55:00Z",
      type: "file",
      fileName: "Hiking_Spots_List.pdf",
      isOwn: true
    }
  ]);

  const [newMessage, setNewMessage] = useState('');

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Send message handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContactId) return;

    const message = {
      id: messages.length + 1,
      senderId: 2, // Current user
      receiverId: selectedContactId,
      text: newMessage,
      timestamp: new Date().toISOString(),
      type: "text",
      isOwn: true
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  // Render message content based on type
  const renderMessageContent = (message) => {
    switch (message.type) {
      case 'image':
        return (
          <div className="max-w-xs">
            <img 
              src={message.text} 
              alt="Shared image" 
              className="rounded-lg w-full h-auto object-cover"
            />
          </div>
        );
      case 'file':
        return (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg max-w-xs">
            <Paperclip className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">{message.fileName}</p>
              <p className="text-xs text-gray-500">PDF Document</p>
            </div>
          </div>
        );
      default:
        return <p className="text-sm">{message.text}</p>;
    }
  };

  // Show empty state when no contact is selected
  if (!selectedContactId) {
    return (
      <div className="h-full flex items-center justify-center ">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16  rounded-full flex items-center justify-center mx-auto mb-4">
            <Smile className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium">Select a contact</p>
          <p className="text-sm">Choose someone to start chatting with</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col ">
      {/* Messages container - scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <img
                src={`https://randomuser.me/api/portraits/${message.isOwn ? 'men' : 'women'}/${message.isOwn ? '2' : selectedContactId}.jpg`}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              
              {/* Message bubble */}
              <div className={`flex flex-col ${message.isOwn ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    message.isOwn
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-900 rounded-bl-sm border'
                  }`}
                >
                  {renderMessageContent(message)}
                </div>
                
                {/* Timestamp */}
                <span className="text-xs text-gray-500 mt-1 px-2">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Auto scroll anchor */}
        <div ref={messagesEndRef} />
        
        {/* Empty state for messages */}
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smile className="w-8 h-8 text-gray-400" />
              </div>
              <p>No messages yet</p>
              <p className="text-sm">Start a conversation!</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Message input - fixed at bottom */}
      <div className="flex-shrink-0 p-4  border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          {/* Attachment button */}
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          {/* Message input */}
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          
          {/* Emoji button */}
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>
          
          {/* Send button */}
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
  )
}

export default MessageChat;