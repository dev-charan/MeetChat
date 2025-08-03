// ContactList.js
import ContactItem from "./ContactItem";

const ContactList = ({ contacts = [], activeContactId, onContactSelect }) => {
  if (!contacts.length) {
    return (
      <div className="flex items-center justify-center p-8 text-center">
        <div>
          <div className="text-gray-400 mb-2">📱</div>
          <div className="text-gray-500 text-sm">No conversations found</div>
        </div>
      </div>
    );
  }
  console.log("ContactList: Contacts:", contacts);

  return (
    <div className="h-full overflow-y-auto scrollbar-custom">
      {contacts.map((conversation, index) => {
        const conversationId = conversation.conversationId;
        console.log(
          "ContactList: Conversation object:",
          conversation,
          "conversationId:",
          conversationId
        );
        if (!conversationId) {
          console.warn(
            "ContactList: Missing conversationId for conversation at index:",
            index
          );
        }
        const uniqueKey =
          conversationId ||
          `conv-${index}-${conversation.otherUser?._id || index}`;

        return (
          <ContactItem
            key={uniqueKey}
            id={conversationId}
            name={conversation.otherUser?.fullname || "Unknown User"}
            avatar={conversation.otherUser?.profilePic}
            unreadCount={conversation.unreadCount || 0}
            isActive={activeContactId === conversationId}
            isOnline={conversation.otherUser?.isOnline}
            onClick={() => {
              console.log(
                "ContactList: Selecting conversation:",
                conversationId,
                "otherUserId:",
                conversation.otherUser?._id
              );
              if (conversationId && conversation.otherUser?._id) {
                onContactSelect({
                  conversationId,
                  otherUserId: conversation.otherUser._id,
                });
              } else {
                console.warn(
                  "ContactList: Cannot select conversation with undefined ID or otherUserId"
                );
              }
            }}
            lastMessage={conversation.lastMessage?.content || "No messages yet"}
            timestamp={
              conversation.lastMessage?.timestamp || conversation.lastActivity
            }
            lastMessageType={conversation.lastMessage?.messageType}
          />
        );
      })}
    </div>
  );
};

export default ContactList;
