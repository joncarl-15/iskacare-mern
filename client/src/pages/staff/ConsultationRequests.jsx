import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, Clock, User, Calendar } from 'lucide-react';
import './ConsultationRequests.css';

const ConsultationRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/consultation-requests`);
            setRequests(res.data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    const handleApprove = async (requestId) => {
        if (!window.confirm('Approve this consultation request and add patient to queue?')) {
            return;
        }

        setLoading(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/consultation-requests/${requestId}/approve`, {
                assignedNurse: user?.username || 'Staff'
            });
            alert('✅ Request approved! Patient added to queue.');
            fetchRequests();
        } catch (error) {
            console.error('Error approving request:', error);
            alert('❌ Failed to approve request');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (requestId) => {
        const notes = prompt('Reason for rejection (optional):');
        if (notes === null) return; // User cancelled

        setLoading(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/consultation-requests/${requestId}/reject`, {
                notes
            });
            alert('Request rejected');
            fetchRequests();
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('❌ Failed to reject request');
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = requests.filter(req => req.status === filter);

    const getStatusBadge = (status) => {
        const badges = {
            pending: { icon: <Clock size={16} />, class: 'badge-pending', text: 'Pending' },
            approved: { icon: <CheckCircle size={16} />, class: 'badge-approved', text: 'Approved' },
            rejected: { icon: <XCircle size={16} />, class: 'badge-rejected', text: 'Rejected' }
        };
        const badge = badges[status];
        return (
            <span className={`status-badge ${badge.class}`}>
                {badge.icon}
                {badge.text}
            </span>
        );
    };

    return (
        <div className="consultation-requests-page">
            <div className="page-header">
                <h1>Consultation Requests</h1>
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({requests.filter(r => r.status === 'pending').length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
                        onClick={() => setFilter('approved')}
                    >
                        Approved ({requests.filter(r => r.status === 'approved').length})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
                        onClick={() => setFilter('rejected')}
                    >
                        Rejected ({requests.filter(r => r.status === 'rejected').length})
                    </button>
                </div>
            </div>

            <div className="requests-grid">
                {filteredRequests.length === 0 ? (
                    <div className="no-requests">
                        <p>No {filter} requests</p>
                    </div>
                ) : (
                    filteredRequests.map(request => (
                        <div key={request._id} className="request-card">
                            <div className="request-card-header">
                                {getStatusBadge(request.status)}
                                <span className="request-date">
                                    <Calendar size={14} />
                                    {new Date(request.createdAt).toLocaleString()}
                                </span>
                            </div>

                            <div className="request-card-body">
                                <div className="patient-info">
                                    <h3>
                                        <User size={18} />
                                        {request.name}
                                    </h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="label">Student ID:</span>
                                            <span className="value">{request.studentId}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Age:</span>
                                            <span className="value">{request.age}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Gender:</span>
                                            <span className="value">{request.gender}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Course:</span>
                                            <span className="value">{request.studentCourse}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Year:</span>
                                            <span className="value">{request.studentYear}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Emergency:</span>
                                            <span className={`value ${request.emergencyStatus === 'Emergency' ? 'emergency' : ''}`}>
                                                {request.emergencyStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="condition-section">
                                    <h4>Medical Complaint</h4>
                                    <p>{request.condition}</p>
                                </div>

                                {request.notes && (
                                    <div className="notes-section">
                                        <h4>Notes</h4>
                                        <p>{request.notes}</p>
                                    </div>
                                )}

                                {request.assignedNurse && (
                                    <div className="assigned-nurse">
                                        <span>Assigned to: <strong>{request.assignedNurse}</strong></span>
                                    </div>
                                )}
                            </div>

                            {request.status === 'pending' && (
                                <div className="request-card-actions">
                                    <button
                                        onClick={() => handleApprove(request._id)}
                                        className="approve-btn"
                                        disabled={loading}
                                    >
                                        <CheckCircle size={18} />
                                        Approve & Add to Queue
                                    </button>
                                    <button
                                        onClick={() => handleReject(request._id)}
                                        className="reject-btn"
                                        disabled={loading}
                                    >
                                        <XCircle size={18} />
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ConsultationRequests;
