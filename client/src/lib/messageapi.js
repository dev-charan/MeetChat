// src/lib/messageapi.js
import { axiosInstance } from "./axios";

// GET: Friends/contacts who are online
export const fetchContacts = () =>
  axiosInstance.get("/messages/friends/online");

// GET: List of conversations for sidebar (if needed)
export const fetchConversations = () =>
  axiosInstance.get("/messages/conversations");

// GET: Paged messages for a conversation
export const fetchMessages = (otherUserId, { page = 1, limit = 50 } = {}) =>
  axiosInstance.get(
    `/messages/conversation/${otherUserId}?page=${page}&limit=${limit}`
  );

// GET: Info about conversation/other user
export const fetchConversationInfo = (otherUserId) =>
  axiosInstance.get(`/messages/conversation/${otherUserId}/info`);

// POST: Send new message
export const sendMessage = (recipientId, content, messageType = "text") =>
  axiosInstance.post("/messages/send", { recipientId, content, messageType });
