import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Save } from 'lucide-react';
import './AddPatient.css';

const AddPatient = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        condition: '',
        doctorAssigned: user?.username || '',
        studentId: '',
        studentCourse: '',
        studentYear: '',
        emergencyStatus: 'Non-Emergency',
        patientType: 'Non-Employee'
    });

    const courses = [
        'BEED', 'BPA', 'BPA-FA', 'BS-Account', 'BSAM', 'BS-Archi',
        'BSBA-FM', 'BSBA-MM', 'BS-Bio', 'BSCE', 'BSED-MT', 'BSEE',
        'BSHM', 'BSIT', 'BSND', 'BSOA', 'DCVET', 'DCET', 'DEET',
        'DIT', 'DOMT-LOM', 'DOMT-MOM'
    ];

    const years = ['1st', '2nd', '3rd', '4th', 'Ladderize', 'Overstaying'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/patients`, {
                ...formData,
                timeIn: new Date()
            });
            alert('✅ Patient added successfully!');
            navigate('/staff/queue');
        } catch (error) {
            console.error('Error adding patient:', error);
            if (error.response?.data?.message) {
                alert('❌ ' + error.response.data.message);
            } else {
                alert('❌ Failed to add patient');
            }
        }
    };

    return (
        <div className="add-patient">
            <h1>Add New Patient</h1>
            <form onSubmit={handleSubmit} className="patient-form">
                <h3>Basic Information</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Patient Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Age</label>
                        <input type="number" name="age" value={formData.age} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Student ID</label>
                        <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Student Course</label>
                        <select name="studentCourse" value={formData.studentCourse} onChange={handleChange} required>
                            <option value="">Select Course</option>
                            {courses.map(course => (
                                <option key={course} value={course}>{course}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Year</label>
                        <select name="studentYear" value={formData.studentYear} onChange={handleChange} required>
                            <option value="">Select Year</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <h3>Personal Details</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} required>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Nurse Assigned</label>
                        <input type="text" name="doctorAssigned" value={formData.doctorAssigned} readOnly style={{ backgroundColor: '#f5f5f5' }} />
                    </div>
                </div>

                <h3>Status</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Emergency Status</label>
                        <select name="emergencyStatus" value={formData.emergencyStatus} onChange={handleChange} required>
                            <option value="Non-Emergency">Non-Emergency</option>
                            <option value="Emergency">Emergency</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Patient Type</label>
                        <select name="patientType" value={formData.patientType} onChange={handleChange} required>
                            <option value="Non-Employee">Non-Employee</option>
                            <option value="Employee">Employee</option>
                            <option value="Student">Student</option>
                        </select>
                    </div>
                </div>

                <h3>Medical Information</h3>
                <div className="form-group">
                    <label>Medical Condition/Complaint</label>
                    <textarea
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                        required
                        rows="4"
                        style={{ resize: 'vertical' }}
                    />
                </div>

                <button type="submit" className="save-btn">
                    <Save size={18} /> Add Patient to Queue
                </button>
            </form>
        </div>
    );
};

export default AddPatient;
