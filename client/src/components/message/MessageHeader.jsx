import React from 'react';
import { Video, Phone, MoreVertical, ArrowLeft } from 'lucide-react';

// Sample contact data - in real app this would come from props/context
const contactsData = {
  1: {
    id: 1,
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    isOnline: true,
    lastSeen: "2 minutes ago"
  },
  2: {
    id: 2,
    name: "Mike Chen",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    isOnline: true,
    lastSeen: "1 minute ago"
  },
  3: {
    id: 3,
    name: "Emma Wilson",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    isOnline: false,
    lastSeen: "10 minutes ago"
  },
  // Add more contacts as needed
};

const MessageHeader = ({ selectedContactId, onBackClick }) => {
  // Get selected user data
  const selectedUser = selectedContactId ? contactsData[selectedContactId] : null;

  // Show placeholder if no contact selected
  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center p-4 border-b border-b-slate-700 bg-gray-50">
        <p className="text-gray-500">Select a contact to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-b-slate-700 ">
      {/* Left side - Back button (mobile only) + User info */}
      <div className="flex items-center gap-3">
        {/* Back button - only visible on mobile */}
        <button
          onClick={onBackClick}
          className="md:hidden p-2  hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Profile picture with online indicator */}
        <div className="relative">
          <img 
            src={selectedUser.avatar} 
            alt={selectedUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          {/* Online status indicator */}
          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        </div>
        
        {/* Name and status */}
        <div className="flex flex-col">
          <h3 className="font-semibold ">{selectedUser.name}</h3>
          <p className="text-sm text-gray-500">
            {selectedUser.isOnline ? 'Online' : `Last seen ${selectedUser.lastSeen}`}
          </p>
        </div>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center gap-2">
        {/* Video call button */}
        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
          <Video className="w-5 h-5" />
        </button>
        
        {/* Voice call button */}
        <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors">
          <Phone className="w-5 h-5" />
        </button>
        
        {/* More options button */}
        <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MessageHeader;