import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Trash2 } from 'lucide-react';
import './ViewPatients.css';

const ViewPatients = () => {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/patients');
            setPatients(res.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const handleDelete = async (patientId, patientName) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete patient "${patientName}"? This action cannot be undone.`
        );

        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:5000/api/patients/${patientId}`);
                alert('Patient deleted successfully');
                fetchPatients(); // Refresh the list
            } catch (error) {
                console.error('Error deleting patient:', error);
                alert('Failed to delete patient. Please try again.');
            }
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="view-patients">
            <div className="page-header">
                <h1>Patient Records</h1>
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Age/Gender</th>
                            <th>Condition</th>
                            <th>Assigned To</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPatients.map(patient => (
                            <tr key={patient._id}>
                                <td>{new Date(patient.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className="patient-name">{patient.name}</div>
                                    <div className="patient-id">{patient.studentId}</div>
                                </td>
                                <td>{patient.age} / {patient.gender}</td>
                                <td>{patient.condition}</td>
                                <td>{patient.doctorAssigned}</td>
                                <td>
                                    <span className={`status-badge ${patient.timeOut ? 'discharged' : 'admitted'}`}>
                                        {patient.timeOut ? 'Discharged' : 'Admitted'}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleDelete(patient._id, patient.name)}
                                        className="delete-btn"
                                        title="Delete Patient"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewPatients;
