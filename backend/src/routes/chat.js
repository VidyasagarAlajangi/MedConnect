const express = require("express");
const chatRouter = express.Router();
const Chat = require("../models/Chat");
const { patientAuth } = require("../middleware/Authentication");

// Save chat message
chatRouter.post("/messages", patientAuth, async (req, res) => {
  try {
    const { text, sender } = req.body;
    const userId = req.user._id;

    let chat = await Chat.findOne({ user: userId });
    
    if (!chat) {
      chat = new Chat({ user: userId, messages: [] });
    }

    chat.messages.push({
      text,
      sender,
      timestamp: new Date()
    });

    await chat.save();
    res.json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get chat history
chatRouter.get("/history", patientAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const chat = await Chat.findOne({ user: userId });
    res.json({ success: true, data: chat?.messages || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = chatRouter;