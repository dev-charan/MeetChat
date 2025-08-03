// chatSlice.js
import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    selectedContactId: null, // conversationId
    otherUserId: null, // otherUser._id
    isTyping: false,
    lastSelectedContactId: null,
    chatUIState: {
      sidebarCollapsed: false,
      searchQuery: "",
      activeFilter: "all",
    },
  },
  reducers: {
    setSelectedContact: (state, action) => {
      console.log("chatSlice: Setting selectedContactId:", action.payload);
      state.lastSelectedContactId = state.selectedContactId;
      state.selectedContactId = action.payload.conversationId;
      state.otherUserId = action.payload.otherUserId;
    },
    clearSelectedContact: (state) => {
      state.selectedContactId = null;
      state.otherUserId = null;
    },
    returnToPreviousContact: (state) => {
      if (state.lastSelectedContactId) {
        const temp = state.selectedContactId;
        state.selectedContactId = state.lastSelectedContactId;
        state.lastSelectedContactId = temp;
        // Note: otherUserId not handled here for simplicity
      }
    },
    setTypingStatus: (state, action) => {
      state.isTyping = action.payload;
    },
    setSidebarCollapsed: (state, action) => {
      state.chatUIState.sidebarCollapsed = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.chatUIState.searchQuery = action.payload;
    },
    setActiveFilter: (state, action) => {
      state.chatUIState.activeFilter = action.payload;
    },
    resetChatState: (state) => {
      state.selectedContactId = null;
      state.otherUserId = null;
      state.lastSelectedContactId = null;
      state.isTyping = false;
      state.chatUIState = {
        sidebarCollapsed: false,
        searchQuery: "",
        activeFilter: "all",
      };
    },
  },
});

export const {
  setSelectedContact,
  clearSelectedContact,
  returnToPreviousContact,
  setTypingStatus,
  setSidebarCollapsed,
  setSearchQuery,
  setActiveFilter,
  resetChatState,
} = chatSlice.actions;

export const selectSelectedContactId = (state) => state.chat.selectedContactId;
export const selectOtherUserId = (state) => state.chat.otherUserId;
export const selectIsTyping = (state) => state.chat.isTyping;
export const selectChatUIState = (state) => state.chat.chatUIState;
export const selectHasSelectedContact = (state) => !!state.chat.otherUserId;

export default chatSlice.reducer;
