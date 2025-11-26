import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle } from 'lucide-react';
import './Queue.css';

const Queue = () => {
    const [queue, setQueue] = useState([]);

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/patients/queue');
            setQueue(res.data);
        } catch (error) {
            console.error('Error fetching queue:', error);
        }
    };

    const handleDischarge = async (id) => {
        if (window.confirm('Are you sure you want to discharge this patient?')) {
            try {
                await axios.put(`http://localhost:5000/api/patients/${id}`, {
                    timeOut: new Date()
                });
                fetchQueue(); // Refresh queue
            } catch (error) {
                console.error('Error discharging patient:', error);
            }
        }
    };

    return (
        <div className="queue-page">
            <div className="page-header">
                <h1>Active Queue</h1>
                <div className="queue-count">
                    <Clock size={20} />
                    <span>{queue.length} Patients Waiting/Admitted</span>
                </div>
            </div>

            <div className="queue-grid">
                {queue.length === 0 ? (
                    <div className="empty-queue">
                        <p>No active patients in the queue.</p>
                    </div>
                ) : (
                    queue.map(patient => (
                        <div key={patient._id} className="queue-card">
                            <div className="queue-header">
                                <span className="queue-time">
                                    In: {new Date(patient.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="queue-status">Active</span>
                            </div>
                            <div className="queue-body">
                                <h3>{patient.name}</h3>
                                <p className="patient-details">
                                    {patient.age} yrs • {patient.gender}
                                </p>
                                <div className="queue-info">
                                    <strong>Condition:</strong> {patient.condition}
                                </div>
                                <div className="queue-info">
                                    <strong>Assigned:</strong> {patient.doctorAssigned}
                                </div>
                            </div>
                            <div className="queue-footer">
                                <button
                                    className="discharge-btn"
                                    onClick={() => handleDischarge(patient._id)}
                                >
                                    <CheckCircle size={18} /> Discharge
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Queue;
