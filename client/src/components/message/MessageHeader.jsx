// MessageHeader.js
import React, { useEffect } from "react";
import { Video, Phone, MoreVertical, ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { useConversationInfo } from "../../hooks/useConversationInfo";

const MessageHeader = ({ onBackClick, showBackButton = false }) => {
  const otherUserId = useSelector((s) => s.chat.otherUserId);

  useEffect(() => {
    console.log("MessageHeader: otherUserId updated to:", otherUserId);
  }, [otherUserId]);

  console.log("MessageHeader: otherUserId =", otherUserId);

  const { data: info, isLoading, error } = useConversationInfo(otherUserId);

  console.log(
    "MessageHeader: conversation info =",
    info,
    "isLoading =",
    isLoading,
    "error =",
    error
  );

  if (!otherUserId) {
    return (
      <div className="flex items-center justify-center p-4 border-b border-gray-200 bg-gray-50">
        <p className="text-gray-500">Select a contact to start chatting</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              onClick={onBackClick}
              className="md:hidden p-2 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex flex-col">
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse" />
          <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse" />
          <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              onClick={onBackClick}
              className="md:hidden p-2 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-500 text-xs">!</span>
          </div>
          <div className="flex flex-col">
            <p className="font-semibold text-red-600">Error loading contact</p>
            <p className="text-sm text-gray-500">Unable to load contact info</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled
            className="p-2 text-gray-300 rounded-full cursor-not-allowed"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            disabled
            className="p-2 text-gray-300 rounded-full cursor-not-allowed"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            disabled
            className="p-2 text-gray-300 rounded-full cursor-not-allowed"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const otherUser = info?.otherUser;

  if (!otherUser) {
    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              onClick={onBackClick}
              className="md:hidden p-2 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-400 text-xs">?</span>
          </div>
          <div className="flex flex-col">
            <p className="font-semibold text-gray-600">Unknown Contact</p>
            <p className="text-sm text-gray-500">
              Contact information unavailable
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-theme="night" className="flex items-center justify-between p-4 border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={onBackClick}
            className="md:hidden p-2  rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="relative">
          <img
            src={
              otherUser.profilePic ||
              "https://avatar.iran.liara.run/public/1.png"
            }
            alt={otherUser.fullname || "User"}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            onError={(e) => {
              e.target.src = "https://avatar.iran.liara.run/public/1.png";
            }}
          />
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${
              otherUser.isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="font-semibold  truncate">
            {otherUser.fullname || "Unknown User"}
          </h3>
          <p className="text-sm text-gray-500">
            {otherUser.isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          aria-label="Video call"
        >
          <Video className="w-5 h-5" />
        </button>
        <button
          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
          aria-label="Voice call"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="More options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MessageHeader;
