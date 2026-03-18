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
  isOpen: false, 
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateChatHistory: (state, action) => {
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
