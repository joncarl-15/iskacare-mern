import React, { useState, useEffect } from 'react';
import { X, LogIn, Bell } from 'lucide-react';
import axios from 'axios';
import './MobileMenu.css';

const MobileMenu = ({ isOpen, onClose, onLoginClick }) => {
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchAnnouncements();
        }
    }, [isOpen]);

    const fetchAnnouncements = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/announcements');
            setAnnouncements(res.data);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    const handleLoginClick = () => {
        onLoginClick();
        onClose();
    };

    return (
        <>
            <div className={`menu-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
            <div className={`mobile-menu ${isOpen ? 'active' : ''}`}>
                <div className="menu-header">
                    <h2>Menu</h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                </div>

                <div className="menu-content">
                    <button onClick={handleLoginClick} className="menu-item login-item">
                        <LogIn size={20} />
                        <span>Login / Sign Up</span>
                    </button>

                    <div className="menu-section">
                        <div className="section-header">
                            <Bell size={20} />
                            <h3>Announcements</h3>
                        </div>

                        <div className="announcements-list">
                            {announcements.length === 0 ? (
                                <p className="no-announcements">No announcements at this time</p>
                            ) : (
                                announcements.map((announcement) => (
                                    <div
                                        key={announcement._id}
                                        className={`announcement-card ${announcement.priority === 'urgent' ? 'urgent' : ''}`}
                                    >
                                        {announcement.priority === 'urgent' && (
                                            <span className="urgent-badge">Urgent</span>
                                        )}
                                        <h4>{announcement.title}</h4>
                                        <p>{announcement.content}</p>
                                        <div className="announcement-meta">
                                            <span className="author">By {announcement.author}</span>
                                            <span className="date">
                                                {new Date(announcement.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileMenu;
