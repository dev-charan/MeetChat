import { Search } from 'lucide-react'
import React, { useState } from 'react'
import ContactList from './components/ContactList'

const contactsData = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    lastMessage: "Hey! Are we still on for lunch tomorrow?",
    timestamp: "2:30 PM",
    unreadCount: 2,
    isOnline: true,
    lastMessageType: "text"
  },
  {
    id: 2,
    name: "Mike Chen",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    lastMessage: "Thanks for the files!",
    timestamp: "1:45 PM",
    unreadCount: 0,
    isOnline: true,
    lastMessageType: "text"
  },
  {
    id: 3,
    name: "Emma Wilson",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    lastMessage: "📎 Document.pdf",
    timestamp: "12:20 PM",
    unreadCount: 1,
    isOnline: false,
    lastMessageType: "file"
  },
  {
    id: 4,
    name: "David Rodriguez",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    lastMessage: "Perfect! Let's schedule that for next week.",
    timestamp: "Yesterday",
    unreadCount: 0,
    isOnline: false,
    lastMessageType: "text"
  },
  {
    id: 5,
    name: "Lisa Park",
    avatar: "https://randomuser.me/api/portraits/women/5.jpg",
    lastMessage: "📷 Photo",
    timestamp: "Yesterday",
    unreadCount: 3,
    isOnline: true,
    lastMessageType: "image"
  },
  {
    id: 6,
    name: "Alex Thompson",
    avatar: "https://randomuser.me/api/portraits/men/6.jpg",
    lastMessage: "Great job on the presentation!",
    timestamp: "Friday",
    unreadCount: 0,
    isOnline: false,
    lastMessageType: "text"
  },
  {
    id: 7,
    name: "Jennifer Lee",
    avatar: "https://randomuser.me/api/portraits/women/7.jpg",
    lastMessage: "Can you review this when you have time?",
    timestamp: "Thursday",
    unreadCount: 1,
    isOnline: true,
    lastMessageType: "text"
  },
  {
    id: 8,
    name: "Robert Kim",
    avatar: "https://randomuser.me/api/portraits/men/8.jpg",
    lastMessage: "🎤 Voice message",
    timestamp: "Wednesday",
    unreadCount: 0,
    isOnline: false,
    lastMessageType: "voice"
  },
  {
    id: 9,
    name: "Sarah Mitchell",
    avatar: "https://randomuser.me/api/portraits/women/9.jpg",
    lastMessage: "Hey! Are we still on for lunch tomorrow?",
    timestamp: "2:30 PM",
    unreadCount: 2,
    isOnline: true,
    lastMessageType: "text"
  },
  {
    id: 10,
    name: "Tom Wilson",
    avatar: "https://randomuser.me/api/portraits/men/10.jpg",
    lastMessage: "Thanks for the files!",
    timestamp: "1:45 PM",
    unreadCount: 0,
    isOnline: true,
    lastMessageType: "text"
  },
  {
    id: 11,
    name: "Kate Brown",
    avatar: "https://randomuser.me/api/portraits/women/11.jpg",
    lastMessage: "📎 Document.pdf",
    timestamp: "12:20 PM",
    unreadCount: 1,
    isOnline: false,
    lastMessageType: "file"
  },
  {
    id: 12,
    name: "James Smith",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    lastMessage: "Perfect! Let's schedule that for next week.",
    timestamp: "Yesterday",
    unreadCount: 0,
    isOnline: false,
    lastMessageType: "text"
  },
  {
    id: 13,
    name: "Anna Davis",
    avatar: "https://randomuser.me/api/portraits/women/13.jpg",
    lastMessage: "📷 Photo",
    timestamp: "Yesterday",
    unreadCount: 3,
    isOnline: true,
    lastMessageType: "image"
  },
  {
    id: 14,
    name: "Mark Johnson",
    avatar: "https://randomuser.me/api/portraits/men/14.jpg",
    lastMessage: "Great job on the presentation!",
    timestamp: "Friday",
    unreadCount: 0,
    isOnline: false,
    lastMessageType: "text"
  },
]

const MessageSidebar = ({ onContactSelect, selectedContactId }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleContactClick = (contactId) => {
    // Call the parent's handler to update selected contact
    onContactSelect(contactId);
  };

  const filteredContacts = contactsData.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='w-full border-r border-r-slate-700  flex flex-col h-full'>
      {/* Fixed Header - won't scroll */}
      <header className='flex items-center justify-between p-5 border-b border-b-slate-700 flex-shrink-0'>
        <div className='flex items-center bg-gray-100 rounded-lg px-3 py-2 flex-1'>
          <Search className='w-4 h-4 text-gray-500 mr-2' />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='bg-transparent outline-none text-sm flex-1 text-gray-700 placeholder-gray-500'
          />
        </div>
      </header>

      {/* Scrollable Contact List - takes remaining space */}
      <div className='flex-1 overflow-y-auto min-h-0'>
        <ContactList 
          contacts={filteredContacts}
          activeContactId={selectedContactId}
          onContactSelect={handleContactClick}
        />
      </div>
    </div>
  )
}

export default MessageSidebar