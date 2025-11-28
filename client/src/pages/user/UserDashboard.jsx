import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Send, Clock, CheckCircle, XCircle, LogOut, FileText, AlertCircle, Menu, X, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatTime, formatDate } from '../../utils/dateUtils';
import './UserDashboard.css';

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        studentId: '',
        age: '',
        gender: 'Male',
        studentCourse: '',
        studentYear: '',
        condition: '',
        emergencyStatus: 'Non-Emergency'
    });
    const [activeTab, setActiveTab] = useState('consult');
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const courses = [
        'BEED', 'BPA', 'BPA-FA', 'BS-Account', 'BSAM', 'BS-Archi',
        'BSBA-FM', 'BSBA-MM', 'BS-Bio', 'BSCE', 'BSED-MT', 'BSEE',
        'BSHM', 'BSIT', 'BSND', 'BSOA', 'DCVET', 'DCET', 'DEET',
        'DIT', 'DOMT-LOM', 'DOMT-MOM'
    ];

    const years = ['1st', '2nd', '3rd', '4th', 'Ladderize', 'Overstaying'];

    useEffect(() => {
        if (user && formData.studentId) {
            fetchMyRequests();
        }
    }, [user, formData.studentId]);

    useEffect(() => {
        // Calculate stats whenever requests change
        if (myRequests.length > 0) {
            const newStats = {
                total: myRequests.length,
                pending: myRequests.filter(r => r.status === 'pending').length,
                approved: myRequests.filter(r => r.status === 'approved').length,
                rejected: myRequests.filter(r => r.status === 'rejected').length
            };
            setStats(newStats);
        }
    }, [myRequests]);

    useEffect(() => {
        if (activeTab === 'chat' && user) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [activeTab, user]);

    useEffect(() => {
        if (activeTab === 'chat') {
            scrollToBottom();
        }
    }, [messages, activeTab]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/staff/conversations`);
            setMessages(res.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
                sender: user.id,
                receiver: null, // Null for staff/system
                content: newMessage
            });
            setNewMessage('');
            fetchMessages();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const fetchMyRequests = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/consultations/my-requests/${formData.studentId}`);
            setMyRequests(res.data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/consultations`, formData);
            alert('✅ Consultation request submitted successfully! Please wait for staff approval.');

            // Reset form
            setFormData({
                ...formData,
                condition: '',
                emergencyStatus: 'Non-Emergency'
            });

            // Refresh requests
            fetchMyRequests();
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('❌ Failed to submit request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock size={18} color="#FFA500" />;
            case 'approved':
                return <CheckCircle size={18} color="#28a745" />;
            case 'rejected':
                return <XCircle size={18} color="#dc3545" />;
            default:
                return null;
        }
    };

    const getStatusClass = (status) => {
        return `status-badge status-${status}`;
    };

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    // ... existing effects ...

    return (
        <div className="user-dashboard-layout">
            <button className={`mobile-menu-btn ${isSidebarOpen ? 'hidden' : ''}`} onClick={toggleSidebar}>
                <Menu size={24} />
            </button>

            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div>
                        <h2>Iska-Care</h2>
                        <p>Welcome, {user?.username || 'Student'}!</p>
                    </div>
                    <button onClick={closeSidebar} className="sidebar-close-btn">
                        <X size={24} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeTab === 'consult' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('consult'); closeSidebar(); }}
                    >
                        <FileText size={20} /> Consultation
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('chat'); closeSidebar(); }}
                    >
                        <MessageCircle size={20} /> Chat with Nurse
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <p>Logged in as:</p>
                        <strong>{user?.username || 'Student'}</strong>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

            <main className="dashboard-main-content">
                {myRequests.length > 0 && (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon bg-blue">
                                <FileText size={24} />
                            </div>
                            <div className="stat-info">
                                <h3>Total Requests</h3>
                                <p>{stats.total}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon bg-orange">
                                <Clock size={24} />
                            </div>
                            <div className="stat-info">
                                <h3>Pending</h3>
                                <p>{stats.pending}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon bg-green">
                                <CheckCircle size={24} />
                            </div>
                            <div className="stat-info">
                                <h3>Approved</h3>
                                <p>{stats.approved}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon bg-red">
                                <AlertCircle size={24} />
                            </div>
                            <div className="stat-info">
                                <h3>Rejected</h3>
                                <p>{stats.rejected}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="dashboard-content">
                    {activeTab === 'consult' && (
                        <>
                            <div className="consultation-form-card">
                                <h2>New Consultation Request</h2>
                                <form onSubmit={handleSubmit} className="consultation-form">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Full Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter your full name"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Student ID *</label>
                                            <input
                                                type="text"
                                                name="studentId"
                                                value={formData.studentId}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter your student ID"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Age *</label>
                                            <input
                                                type="number"
                                                name="age"
                                                value={formData.age}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter your age"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Gender *</label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} required>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Course *</label>
                                            <select name="studentCourse" value={formData.studentCourse} onChange={handleChange} required>
                                                <option value="">Select Course</option>
                                                {courses.map(course => (
                                                    <option key={course} value={course}>{course}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Year *</label>
                                            <select name="studentYear" value={formData.studentYear} onChange={handleChange} required>
                                                <option value="">Select Year</option>
                                                {years.map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Emergency Status *</label>
                                        <select name="emergencyStatus" value={formData.emergencyStatus} onChange={handleChange} required>
                                            <option value="Non-Emergency">Non-Emergency</option>
                                            <option value="Emergency">Emergency</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Medical Complaint/Condition *</label>
                                        <textarea
                                            name="condition"
                                            value={formData.condition}
                                            onChange={handleChange}
                                            required
                                            rows="4"
                                            placeholder="Describe your symptoms or medical concern"
                                        />
                                    </div>

                                    <button type="submit" className="submit-btn" disabled={loading}>
                                        <Send size={18} />
                                        {loading ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                </form>
                            </div>

                            {myRequests.length > 0 && (
                                <div className="my-requests-card">
                                    <h2>My Requests</h2>
                                    <div className="requests-list">
                                        {myRequests.map(request => (
                                            <div key={request._id} className="request-item">
                                                <div className="request-header">
                                                    <span className={getStatusClass(request.status)}>
                                                        {getStatusIcon(request.status)}
                                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                    </span>
                                                    <span className="request-date">
                                                        {formatDate(request.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="request-condition">{request.condition}</p>
                                                {request.notes && (
                                                    <p className="request-notes"><strong>Notes:</strong> {request.notes}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'chat' && (
                        <div className="chat-container">
                            <div className="chat-header">
                                <h3>Chat with School Nurse</h3>
                            </div>
                            <div className="messages-list">
                                {messages.length === 0 ? (
                                    <div className="empty-chat">
                                        <p>Start a conversation with the school nurse.</p>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => {
                                        const isMe = msg.sender === user.id;
                                        return (
                                            <div
                                                key={index}
                                                className={`message-bubble ${isMe ? 'message-sent' : 'message-received'}`}
                                            >
                                                {msg.content}
                                                <div className="message-time">
                                                    {formatTime(msg.createdAt)}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <form className="chat-input-area" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    className="chat-input"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
