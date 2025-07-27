import React from 'react';
import ContactItem from './ContactItem';

const ContactList = ({ contacts, activeContactId, onContactSelect }) => {
  return (
    <div className="h-full overflow-y-auto scrollbar-custom ">
      {contacts?.map((contact) => (
        <ContactItem 
          key={contact.id}
          id={contact.id}
          name={contact.name}
          avatar={contact.avatar}
          lastMessage={contact.lastMessage}
          timestamp={contact.timestamp}
          unreadCount={contact.unreadCount}
          isOnline={contact.isOnline}
          lastMessageType={contact.lastMessageType}
          isActive={activeContactId === contact.id}
          onClick={() => onContactSelect(contact.id)}
        />
      ))}
    </div>
  );
};

export default ContactList;