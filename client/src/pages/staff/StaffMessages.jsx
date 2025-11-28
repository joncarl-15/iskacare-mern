import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Send, MessageCircle, User, ArrowLeft } from 'lucide-react';
import { formatTime } from '../../utils/dateUtils';
import './StaffMessages.css';

const StaffMessages = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        // Poll for new conversations
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser._id);
            // Poll for new messages in active chat
            const interval = setInterval(() => fetchMessages(selectedUser._id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/staff/conversations`);
            setConversations(res.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/user/${userId}`);
            setMessages(res.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            setLoading(true);
            await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
                sender: user.id, // Staff ID
                receiver: selectedUser._id,
                content: newMessage
            });
            setNewMessage('');
            fetchMessages(selectedUser._id);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`staff-messages-container ${selectedUser ? 'chat-active' : ''}`}>
            <div className="conversations-sidebar">
                <div className="sidebar-header">
                    <h2>Messages</h2>
                </div>
                <div className="conversations-list">
                    {conversations.map(conv => (
                        <div
                            key={conv.user._id}
                            className={`conversation-item ${selectedUser?._id === conv.user._id ? 'active' : ''}`}
                            onClick={() => setSelectedUser(conv.user)}
                        >
                            <div className="conversation-user">{conv.user.username}</div>
                            <div className="conversation-preview">
                                {conv.lastMessage.content}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-area">
                {selectedUser ? (
                    <>
                        <div className="chat-header">
                            <button className="back-btn mobile-only" onClick={() => setSelectedUser(null)}>
                                <ArrowLeft size={24} />
                            </button>
                            <User size={24} />
                            <h3>{selectedUser.username}</h3>
                        </div>
                        <div className="messages-list">
                            {messages.map((msg, index) => {
                                const isStaff = msg.sender === user.id;
                                return (
                                    <div
                                        key={index}
                                        className={`message-bubble ${isStaff ? 'message-sent' : 'message-received'}`}
                                    >
                                        {msg.content}
                                        <div className="message-time">
                                            {formatTime(msg.createdAt)}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <textarea
                                className="chat-input"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                            />
                            <button type="submit" className="send-btn" disabled={loading || !newMessage.trim()}>
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <MessageCircle size={48} />
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffMessages;
