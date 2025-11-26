import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Printer, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './PrintPatients.css';

const PrintPatients = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatients, setSelectedPatients] = useState([]);

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

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedPatients(patients.map(p => p._id));
        } else {
            setSelectedPatients([]);
        }
    };

    const handleSelectPatient = (patientId) => {
        if (selectedPatients.includes(patientId)) {
            setSelectedPatients(selectedPatients.filter(id => id !== patientId));
        } else {
            setSelectedPatients([...selectedPatients, patientId]);
        }
    };

    const generateMedicalSlip = () => {
        if (selectedPatients.length === 0) {
            alert('Please select at least one patient to generate medical slip');
            return;
        }

        const doc = new jsPDF();
        const selectedPatientsData = patients.filter(p => selectedPatients.includes(p._id));

        selectedPatientsData.forEach((patient, index) => {
            if (index > 0) {
                doc.addPage();
            }

            // Header
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('ISKA-CARE MEDICAL SLIP', 105, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('University Health Center', 105, 28, { align: 'center' });

            // Line separator
            doc.setLineWidth(0.5);
            doc.line(20, 35, 190, 35);

            // Date
            doc.setFontSize(10);
            doc.text(`Date: ${new Date().toLocaleDateString()} `, 20, 45);
            doc.text(`Time: ${new Date().toLocaleTimeString()} `, 150, 45);

            // Patient Information Section
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('PATIENT INFORMATION', 20, 55);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            let yPos = 65;

            doc.text(`Name: ${patient.name} `, 20, yPos);
            yPos += 7;
            doc.text(`Student ID: ${patient.studentId} `, 20, yPos);
            doc.text(`Age: ${patient.age} `, 120, yPos);
            yPos += 7;
            doc.text(`Gender: ${patient.gender} `, 20, yPos);
            doc.text(`Course: ${patient.studentCourse} `, 120, yPos);
            yPos += 7;
            doc.text(`Year: ${patient.studentYear} `, 20, yPos);
            doc.text(`Patient Type: ${patient.patientType} `, 120, yPos);
            yPos += 7;
            doc.text(`Emergency Status: ${patient.emergencyStatus} `, 20, yPos);

            // Vital Signs Section
            yPos += 15;
            doc.setFont('helvetica', 'bold');
            doc.text('VITAL SIGNS', 20, yPos);
            yPos += 10;

            doc.setFont('helvetica', 'normal');
            doc.text('Blood Pressure: _______________', 20, yPos);
            doc.text('Temperature: _______________', 120, yPos);
            yPos += 7;
            doc.text('Pulse Rate: _______________', 20, yPos);
            doc.text('Respiratory Rate: _______________', 120, yPos);
            yPos += 7;
            doc.text('Weight: _______________', 20, yPos);
            doc.text('Height: _______________', 120, yPos);

            // Chief Complaint / Condition
            yPos += 15;
            doc.setFont('helvetica', 'bold');
            doc.text('CHIEF COMPLAINT / CONDITION', 20, yPos);
            yPos += 10;

            doc.setFont('helvetica', 'normal');
            const conditionLines = doc.splitTextToSize(patient.condition, 170);
            doc.text(conditionLines, 20, yPos);
            yPos += (conditionLines.length * 7) + 5;

            // Diagnosis Section
            yPos += 10;
            doc.setFont('helvetica', 'bold');
            doc.text('DIAGNOSIS', 20, yPos);
            yPos += 10;

            doc.setFont('helvetica', 'normal');
            doc.text('_________________________________________________________________', 20, yPos);
            yPos += 7;
            doc.text('_________________________________________________________________', 20, yPos);

            // Treatment / Medication
            yPos += 15;
            doc.setFont('helvetica', 'bold');
            doc.text('TREATMENT / MEDICATION', 20, yPos);
            yPos += 10;

            doc.setFont('helvetica', 'normal');
            doc.text('_________________________________________________________________', 20, yPos);
            yPos += 7;
            doc.text('_________________________________________________________________', 20, yPos);
            yPos += 7;
            doc.text('_________________________________________________________________', 20, yPos);

            // Recommendations
            yPos += 15;
            doc.setFont('helvetica', 'bold');
            doc.text('RECOMMENDATIONS', 20, yPos);
            yPos += 10;

            doc.setFont('helvetica', 'normal');
            doc.text('_________________________________________________________________', 20, yPos);
            yPos += 7;
            doc.text('_________________________________________________________________', 20, yPos);

            // Signature Section
            yPos = 250; // Fixed position near bottom
            doc.setFont('helvetica', 'bold');
            doc.text('SIGNATURES', 20, yPos);
            yPos += 10;

            doc.setFont('helvetica', 'normal');
            doc.text('Attending Nurse/Doctor:', 20, yPos);
            doc.text(`${patient.doctorAssigned} `, 20, yPos + 7);
            doc.line(20, yPos + 15, 90, yPos + 15);
            doc.setFontSize(8);
            doc.text('Signature over Printed Name', 20, yPos + 20);

            doc.setFontSize(10);
            doc.text('Patient/Guardian:', 120, yPos);
            doc.line(120, yPos + 15, 190, yPos + 15);
            doc.setFontSize(8);
            doc.text('Signature over Printed Name', 120, yPos + 20);

            // Footer
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text('This is an official medical document. Keep for your records.', 105, 285, { align: 'center' });
        });

        doc.save(`Medical_Slips_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="print-patients-page">
            <div className="no-print page-header">
                <h1>Print Patient Records</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={generateMedicalSlip}
                        className="print-btn"
                        style={{ backgroundColor: '#007bff' }}
                        disabled={selectedPatients.length === 0}
                    >
                        <FileText size={20} /> Generate Medical Slip ({selectedPatients.length})
                    </button>
                    <button onClick={handlePrint} className="print-btn">
                        <Printer size={20} /> Print All
                    </button>
                </div>
            </div>

            <div className="patients-table-container">
                <table className="patients-table">
                    <thead>
                        <tr>
                            <th className="no-print">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={selectedPatients.length === patients.length && patients.length > 0}
                                />
                            </th>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Gender</th>
                            <th>Course</th>
                            <th>Year</th>
                            <th>Condition</th>
                            <th>Doctor Assigned</th>
                            <th>Date Admitted</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((patient) => (
                            <tr key={patient._id}>
                                <td className="no-print">
                                    <input
                                        type="checkbox"
                                        checked={selectedPatients.includes(patient._id)}
                                        onChange={() => handleSelectPatient(patient._id)}
                                    />
                                </td>
                                <td>{patient.studentId}</td>
                                <td>{patient.name}</td>
                                <td>{patient.age}</td>
                                <td>{patient.gender}</td>
                                <td>{patient.studentCourse}</td>
                                <td>{patient.studentYear}</td>
                                <td>{patient.condition}</td>
                                <td>{patient.doctorAssigned}</td>
                                <td>{new Date(patient.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PrintPatients;
