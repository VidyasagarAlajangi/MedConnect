import React, { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import useSocket from '../../utils/useSocket';
import axiosInstance from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

export default function DoctorChat({ appointmentId, onClose, otherUserName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const user = useSelector(state => state.auth.user);
  const token = localStorage.getItem('token');
  const socket = useSocket(token);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherTyping]);

  useEffect(() => {
    if (!appointmentId || !socket) return;

    socket.emit('appointment:join', appointmentId);

    const fetchHistory = async () => {
      try {
        const res = await axiosInstance.get(`/api/messages/${appointmentId}`);
        if (res.data.success) {
          setMessages(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load chat history');
      }
    };
    fetchHistory();

    const handleMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };
    
    const handleTyping = ({ isTyping }) => {
      setOtherTyping(isTyping);
    };

    socket.on('chat:message', handleMessage);
    socket.on('chat:typing', handleTyping);

    return () => {
      socket.off('chat:message', handleMessage);
      socket.off('chat:typing', handleTyping);
    };
  }, [appointmentId, socket, token]);

  const handleType = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      socket?.emit('chat:typing', { appointmentId, isTyping: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('chat:typing', { appointmentId, isTyping: false });
    }, 1500);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const text = newMessage;
    setNewMessage('');
    setIsTyping(false);
    clearTimeout(typingTimeoutRef.current);
    socket.emit('chat:typing', { appointmentId, isTyping: false });

    try {
      await axiosInstance.post(`/api/messages/${appointmentId}`, { text });
    } catch (err) {
      toast.error('Failed to send message');
      setNewMessage(text);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 z-50 overflow-hidden">
      
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-3 flex justify-between items-center text-white">
        <div className="font-semibold text-sm truncate pr-2">
          Chat with {otherUserName || 'Doctor'}
        </div>
        <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-xs my-auto">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === user?._id;
            return (
              <div key={msg._id || i} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                <div className={`px-3 py-2 rounded-lg text-sm shadow-sm ${
                  isMe ? 'bg-teal-500 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
                <div className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        )}
        
        {otherTyping && (
          <div className="self-start bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-xs animate-pulse w-max">
            Typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      
      <form onSubmit={handleSend} className="p-3 bg-white border-t flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={handleType}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
