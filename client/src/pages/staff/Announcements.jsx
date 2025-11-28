import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Announcements.css';

const Announcements = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        priority: 'normal',
        author: user?.username || 'Staff'
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/announcements/all`);
            setAnnouncements(res.data);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/announcements`, {
                ...formData,
                author: user?.username || 'Staff'
            });
            alert('Announcement created successfully!');
            setFormData({
                title: '',
                content: '',
                priority: 'normal',
                author: user?.username || 'Staff'
            });
            setShowForm(false);
            fetchAnnouncements();
        } catch (error) {
            console.error('Error creating announcement:', error);
            alert('Failed to create announcement');
        }
    };

    const handleDelete = async (id, title) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete announcement "${title}"?`
        );

        if (confirmDelete) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/announcements/${id}`);
                alert('Announcement deleted successfully');
                fetchAnnouncements();
            } catch (error) {
                console.error('Error deleting announcement:', error);
                alert('Failed to delete announcement');
            }
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/announcements/${id}`, {
                isActive: !currentStatus
            });
            fetchAnnouncements();
        } catch (error) {
            console.error('Error updating announcement:', error);
        }
    };

    return (
        <div className="announcements-page">
            <div className="page-header">
                <h1>Manage Announcements</h1>
                <button onClick={() => setShowForm(!showForm)} className="add-btn">
                    <Plus size={20} /> {showForm ? 'Cancel' : 'New Announcement'}
                </button>
            </div>

            {showForm && (
                <div className="announcement-form-card">
                    <h2>Create New Announcement</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="Enter announcement title"
                            />
                        </div>

                        <div className="form-group">
                            <label>Content *</label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                required
                                rows="4"
                                placeholder="Enter announcement content"
                            />
                        </div>

                        <div className="form-group">
                            <label>Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                <option value="normal">Normal</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>

                        <button type="submit" className="submit-btn">
                            Create Announcement
                        </button>
                    </form>
                </div>
            )}

            <div className="announcements-list">
                <h2>All Announcements ({announcements.length})</h2>
                {announcements.length === 0 ? (
                    <p className="no-data">No announcements yet. Create one to get started!</p>
                ) : (
                    <div className="announcements-grid">
                        {announcements.map((announcement) => (
                            <div
                                key={announcement._id}
                                className={`announcement-item ${announcement.priority === 'urgent' ? 'urgent' : ''} ${!announcement.isActive ? 'inactive' : ''}`}
                            >
                                <div className="announcement-header">
                                    {announcement.priority === 'urgent' && (
                                        <span className="urgent-badge">
                                            <AlertCircle size={16} /> Urgent
                                        </span>
                                    )}
                                    {!announcement.isActive && (
                                        <span className="inactive-badge">Inactive</span>
                                    )}
                                </div>

                                <h3>{announcement.title}</h3>
                                <p>{announcement.content}</p>

                                <div className="announcement-footer">
                                    <div className="meta">
                                        <span className="author">By {announcement.author}</span>
                                        <span className="date">
                                            {new Date(announcement.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="actions">
                                        <button
                                            onClick={() => toggleActive(announcement._id, announcement.isActive)}
                                            className={`toggle-btn ${announcement.isActive ? 'active' : 'inactive'}`}
                                        >
                                            {announcement.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(announcement._id, announcement.title)}
                                            className="delete-btn-small"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Announcements;
