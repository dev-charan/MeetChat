import React, { useState } from 'react'
import MessageSidebar from './MessageSidebar'
import MessageHeader from './MessageHeader'
import MessageChat from './MessageChat'

const MessageLayout = () => {
  const [selectedContactId, setSelectedContactId] = useState(null)

  const handleContactSelect = (contactId) => {
    setSelectedContactId(contactId)
  }

  const handleBackToSidebar = () => {
    setSelectedContactId(null)
  }

  return (
    <div className='flex w-full h-full overflow-hidden'>
      {/* Sidebar - Full width on mobile when no contact selected, fixed width on desktop */}
      <div className={`
        ${selectedContactId ? 'hidden md:block' : 'block'} 
        w-full md:w-[23%] flex-shrink-0
      `}>
        <MessageSidebar 
          onContactSelect={handleContactSelect}
          selectedContactId={selectedContactId}
        />
      </div>

      {/* Chat Area - Show only when contact selected on mobile, always show on desktop */}
      <div className={`
        ${!selectedContactId ? 'hidden md:flex' : 'flex'} 
        flex-col flex-1 min-w-0
      `}>
        {/* Fixed Header */}
        <div className="flex-shrink-0">
          <MessageHeader 
            selectedContactId={selectedContactId}
            onBackClick={handleBackToSidebar}
          />
        </div>
        
        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-hidden min-h-0">
          <MessageChat selectedContactId={selectedContactId} />
        </div>
      </div>
    </div>
  )
}

export default MessageLayout