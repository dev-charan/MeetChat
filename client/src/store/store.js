import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice";

// Add additional reducers here as your app grows
export const store = configureStore({
  reducer: {
    chat: chatReducer,
    // more slices can be added here in the future
  },
});
