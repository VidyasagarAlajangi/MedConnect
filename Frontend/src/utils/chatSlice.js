import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [
    {
      id: 1,
      text: "**Hello! How can I assist you with your health concerns today?**",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ],
  chatHistory: [],
  isOpen: false, // Optional: if we want to manage chatbot modal open state globally later
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateChatHistory: (state, action) => {
      // action.payload is { userMessage, botReply }
      // Keep last 20 turns (10 exchanges) to stay within token limits
      const newHistory = [
        ...state.chatHistory,
        { role: "user", text: action.payload.userMessage },
        { role: "model", text: action.payload.botReply },
      ];
      state.chatHistory = newHistory.slice(-18);
    },
    clearChat: (state) => {
      state.messages = initialState.messages;
      state.chatHistory = [];
    },
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { addMessage, updateChatHistory, clearChat, toggleChat } = chatSlice.actions;

export default chatSlice.reducer;
