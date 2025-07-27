import React from 'react';
import Avatar from './Avatar';

const ContactItem = ({ 
  id, 
  name, 
  avatar, 
  lastMessage, 
  timestamp, 
  unreadCount, 
  isOnline, 
  lastMessageType,
  isActive,
  onClick 
}) => {
  return (
    <div 
      className={`
        flex items-center p-4 cursor-pointer transition-colors duration-200 border-b-slate-600
         border-gray-50 
        ${isActive ? 'btn-active border-r-4 border-r-blue-500' : ''}
      `}
      onClick={onClick}
    >
      <div className="mr-3 flex-shrink-0">
        <Avatar src={avatar} alt={name} isOnline={isOnline} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-sm font-semibold  truncate flex-1">
            {name}
          </h4>
          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
            {timestamp}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 truncate flex-1">
            {lastMessage}
          </p>
          {unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full min-w-[18px] text-center ml-2 flex-shrink-0">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactItem;
