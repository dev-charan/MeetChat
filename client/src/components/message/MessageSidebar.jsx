import { useConversations } from "../../hooks/useConversationInfo";
import { useState, useMemo } from "react";
import { Search, MessageSquare, Users, Bell } from "lucide-react";
import ContactList from "./components/ContactList";

// Define LoadingState and EmptyState before MessageSidebar
const LoadingState = () => (
  <div className="flex items-center justify-center p-12">
    <div className="text-center">
      <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
      <p className="text-sm text-gray-500 font-medium">
        Loading conversations...
      </p>
    </div>
  </div>
);

const EmptyState = ({ searchQuery, activeFilter }) => (
  <div className="flex items-center justify-center p-12 h-full">
    <div className="text-center max-w-sm">
      <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {searchQuery
          ? "No matches found"
          : activeFilter === "unread"
          ? "No unread messages"
          : "No conversations"}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        {searchQuery
          ? `Try searching for something else or clear your search.`
          : activeFilter === "unread"
          ? "All caught up! No unread messages."
          : "Start a new conversation to see it here."}
      </p>
    </div>
  </div>
);

const MessageSidebar = ({ onContactSelect, selectedContactId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: conversations = [], isLoading, error } = useConversations();
  console.log("MessageSidebar: Conversations data:", conversations);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      if (!conv?.otherUser?.fullname) return false;

      const matchesSearch = conv.otherUser.fullname
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      let matchesFilter = true;
      switch (activeFilter) {
        case "unread":
          matchesFilter = (conv.unreadCount || 0) > 0;
          break;
        case "online":
          matchesFilter = conv.otherUser.isOnline === true;
          break;
        case "all":
        default:
          matchesFilter = true;
      }

      return matchesSearch && matchesFilter;
    });
  }, [conversations, searchQuery, activeFilter]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  if (error) {
    return (
      <div className="w-full border-r  flex flex-col h-full">
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-red-600 font-medium mb-1">Connection Error</p>
            <p className="text-sm text-gray-500">
              Unable to load conversations
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border-r  flex flex-col h-full">
      <header className="flex-shrink-0 p-4 border-b ">
        <div className="flex items-center justify-between mb-4">
         
        
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border  rounded-xl text-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                     transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 "
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex bg-gray-50 rounded-lg p-1">
          {[
            { key: "all", label: "All", icon: Users },
            { key: "unread", label: "Unread", icon: Bell },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeFilter === key
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              <Icon className="w-4 h-4 mr-1.5" />
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <LoadingState />
        ) : filteredConversations.length === 0 ? (
          <EmptyState searchQuery={searchQuery} activeFilter={activeFilter} />
        ) : (
          <ContactList
            contacts={filteredConversations}
            activeContactId={selectedContactId}
            onContactSelect={onContactSelect}
          />
        )}
      </div>

      {conversations.length > 0 && !isLoading && (
        <footer className="flex-shrink-0 px-4 py-3 bg-gray-50 border-t ">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium">
              {filteredConversations.length} of {conversations.length} chats
            </span>
            {conversations.filter((c) => (c.unreadCount || 0) > 0).length >
              0 && (
              <span className="flex items-center font-medium">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-1.5"></div>
                {
                  conversations.filter((c) => (c.unreadCount || 0) > 0).length
                }{" "}
                unread
              </span>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};

export default MessageSidebar;
