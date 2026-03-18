import { createSlice } from '@reduxjs/toolkit';

let nextId = 1;

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
  },
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        id: nextId++,
        type: action.payload.type || 'info',
        message: action.payload.message,
        read: false,
        timestamp: action.payload.timestamp || new Date().toISOString(),
      };
      state.items.unshift(notification);
      state.unreadCount += 1;
      if (state.items.length > 50) state.items = state.items.slice(0, 50);
    },
    markAllRead: (state) => {
      state.items.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    },
    markRead: (state, action) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && !item.read) {
        item.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markAllRead, markRead, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
