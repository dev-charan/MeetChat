import React from "react";
import Avatar from "./Avatar";

const ContactItem = ({
  id,
  name,
  avatar,
  lastMessage,
  timestamp,
  unreadCount = 0,
  isOnline = false,
  lastMessageType,
  isActive = false,
  onClick,
}) => {
  const handleClick = () => {
    console.log("ContactItem: Clicked, ID:", id);
    if (onClick && typeof onClick === "function") {
      onClick(id);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return "now";
      } else if (diffInHours < 24) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (diffInHours < 168) {
        // 7 days
        return date.toLocaleDateString([], { weekday: "short" });
      } else {
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
      }
    } catch (error) {
      return "";
    }
  };

  return (
    <div
      className={`
        flex items-center p-4 cursor-pointer transition-all duration-200 
         border-b 
        ${
          isActive
            ? "bg-blue-50 border-r-4 border-r-blue-500 shadow-sm"
            : ""
        }
      `}
      onClick={handleClick}
    >
      {/* Avatar Section */}
      <div className="mr-3 flex-shrink-0">
        <Avatar
          src={avatar}
          alt={name}
          isOnline={isOnline}
        />
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        {/* Name and Timestamp Row */}
        <div className="flex justify-between items-center mb-1">
          <h4
            className={`text-sm font-semibold truncate flex-1 ${
              isActive ? "text-blue-900" : ""
            }`}
          >
            {name}
          </h4>
          <span className="text-xs  ml-2 flex-shrink-0">
            {formatTimestamp(timestamp)}
          </span>
        </div>

        {/* Last Message and Unread Count Row */}
        <div className="flex justify-between items-center">
          <p
            className={`text-sm truncate flex-1 ${
              unreadCount > 0 ? " font-medium" : ""
            }`}
          >
            {lastMessageType === "image"
              ? "📷 Photo"
              : lastMessageType === "file"
              ? "📎 File"
              : lastMessage || "No messages yet"}
          </p>

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className="bg-blue-500  text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center ml-2 flex-shrink-0">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactItem;
