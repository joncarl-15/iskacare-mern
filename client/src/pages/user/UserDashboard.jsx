import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Send, Clock, CheckCircle, XCircle, LogOut, FileText, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });

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

    const fetchMyRequests = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/consultation-requests/user/${formData.studentId}`);
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
            await axios.post('http://localhost:5000/api/consultation-requests', formData);
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

    return (
        <div className="user-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <div>
                        <h1>Welcome, {user?.username || 'Student'}!</h1>
                        <p>Request a consultation and track your requests</p>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>

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
                                            {new Date(request.createdAt).toLocaleDateString()}
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
            </div>
        </div>
    );
};

export default UserDashboard;
