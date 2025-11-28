import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Printer, FileBarChart, FileDown } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import './MonthlyReport.css';

const MonthlyReport = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        byGender: { Male: 0, Female: 0, Other: 0 },
        byAgeGroup: { '0-18': 0, '19-25': 0, '26+': 0 },
        topConditions: []
    });
    const componentRef = useRef();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/patients`);
            const allPatients = res.data;

            // Filter for current month and year
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();

            const patients = allPatients.filter(p => {
                const patientDate = new Date(p.createdAt);
                return patientDate.getMonth() === currentMonth &&
                    patientDate.getFullYear() === currentYear;
            });

            const totalPatients = patients.length;

            const byGender = patients.reduce((acc, curr) => {
                acc[curr.gender] = (acc[curr.gender] || 0) + 1;
                return acc;
            }, { Male: 0, Female: 0, Other: 0 });

            const byAgeGroup = patients.reduce((acc, curr) => {
                if (curr.age <= 18) acc['0-18']++;
                else if (curr.age <= 25) acc['19-25']++;
                else acc['26+']++;
                return acc;
            }, { '0-18': 0, '19-25': 0, '26+': 0 });

            const conditions = patients.reduce((acc, curr) => {
                acc[curr.condition] = (acc[curr.condition] || 0) + 1;
                return acc;
            }, {});

            const topConditions = Object.entries(conditions)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            setStats({ totalPatients, byGender, byAgeGroup, topConditions });

        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const exportToExcel = async () => {
        try {
            // Fetch all patients for current month
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/patients`);
            const allPatients = res.data;

            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();

            const patients = allPatients.filter(p => {
                const patientDate = new Date(p.createdAt);
                return patientDate.getMonth() === currentMonth &&
                    patientDate.getFullYear() === currentYear;
            });

            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet(`Monthly Report ${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);

            // Define columns with proper widths
            ws.columns = [
                { header: 'Patient Name', key: 'name', width: 20 },
                { header: 'Age', key: 'age', width: 8 },
                { header: 'Gender', key: 'gender', width: 12 },
                { header: 'Student ID', key: 'studentId', width: 15 },
                { header: 'Course', key: 'course', width: 15 },
                { header: 'Year Level', key: 'year', width: 12 },
                { header: 'Patient Type', key: 'patientType', width: 15 },
                { header: 'Emergency Status', key: 'emergencyStatus', width: 18 },
                { header: 'Medical Condition', key: 'condition', width: 25 },
                { header: 'Date Admitted', key: 'dateAdmitted', width: 15 },
                { header: 'Time In', key: 'timeIn', width: 18 },
                { header: 'Time Out', key: 'timeOut', width: 18 },
                { header: 'Nurse Assigned', key: 'nurseAssigned', width: 18 },
                { header: 'Status', key: 'status', width: 15 }
            ];

            // Style the header row
            ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            ws.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFDC3545' } // Red background
            };
            ws.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

            // Add patient data
            patients.forEach(patient => {
                ws.addRow({
                    name: patient.name,
                    age: patient.age,
                    gender: patient.gender,
                    studentId: patient.studentId || '',
                    course: patient.studentCourse || '',
                    year: patient.studentYear || '',
                    patientType: patient.patientType || 'Student',
                    emergencyStatus: patient.emergencyStatus || 'Non-Emergency',
                    condition: patient.condition,
                    dateAdmitted: new Date(patient.createdAt).toLocaleDateString(),
                    timeIn: new Date(patient.timeIn).toLocaleTimeString(),
                    timeOut: patient.timeOut ? new Date(patient.timeOut).toLocaleTimeString() : '',
                    nurseAssigned: patient.doctorAssigned,
                    status: patient.status || 'Checked Out'
                });
            });

            // Add summary section
            const summaryStartRow = patients.length + 3;
            ws.mergeCells(`A${summaryStartRow}:N${summaryStartRow}`);
            ws.getCell(`A${summaryStartRow}`).value = `Monthly Report Summary for ${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
            ws.getCell(`A${summaryStartRow}`).font = { bold: true, size: 12 };
            ws.getCell(`A${summaryStartRow}`).alignment = { horizontal: 'center' };

            const summaryRow = summaryStartRow + 1;
            ws.getCell(`A${summaryRow}`).value = 'Total Patients:';
            ws.getCell(`B${summaryRow}`).value = patients.length;
            ws.getCell(`B${summaryRow}`).font = { bold: true };

            ws.getCell(`C${summaryRow}`).value = 'Emergency Cases:';
            ws.getCell(`D${summaryRow}`).value = patients.filter(p => p.emergencyStatus === 'Emergency').length;
            ws.getCell(`D${summaryRow}`).font = { bold: true };

            ws.getCell(`E${summaryRow}`).value = 'Employees:';
            ws.getCell(`F${summaryRow}`).value = patients.filter(p => p.patientType === 'Employee').length;
            ws.getCell(`F${summaryRow}`).font = { bold: true };

            ws.getCell(`G${summaryRow}`).value = 'Students:';
            ws.getCell(`H${summaryRow}`).value = patients.filter(p => p.patientType === 'Student').length;
            ws.getCell(`H${summaryRow}`).font = { bold: true };

            ws.getCell(`I${summaryRow}`).value = 'Non-Employees:';
            ws.getCell(`J${summaryRow}`).value = patients.filter(p => p.patientType === 'Non-Employee').length;
            ws.getCell(`J${summaryRow}`).font = { bold: true };

            // Generate and download
            const buffer = await wb.xlsx.writeBuffer();
            const data = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(data, `Monthly_Report_${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).replace(' ', '_')}.xlsx`);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Failed to export to Excel');
        }
    };

    return (
        <div className="monthly-report-page">
            <div className="no-print page-header">
                <h1>Monthly Report</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={exportToExcel} className="print-btn" style={{ backgroundColor: '#28a745' }}>
                        <FileDown size={20} /> Export to Excel
                    </button>
                    <button onClick={handlePrint} className="print-btn">
                        <Printer size={20} /> Print Report
                    </button>
                </div>
            </div>

            <div className="report-container" ref={componentRef}>
                <div className="report-header">
                    <div className="logo-area">
                        <FileBarChart size={40} color="var(--primary-red)" />
                        <div>
                            <h2>Iska-Care Monthly Health Report</h2>
                            <p>Report Date: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="report-body">
                    <div className="report-section">
                        <h3>Overview</h3>
                        <div className="summary-box">
                            <span className="label">Total Patients Served</span>
                            <span className="value">{stats.totalPatients}</span>
                        </div>
                    </div>

                    <div className="report-grid">
                        <div className="report-section">
                            <h3>Demographics</h3>
                            <table className="stats-table">
                                <tbody>
                                    <tr>
                                        <td>Male</td>
                                        <td>{stats.byGender.Male}</td>
                                    </tr>
                                    <tr>
                                        <td>Female</td>
                                        <td>{stats.byGender.Female}</td>
                                    </tr>
                                    <tr>
                                        <td>Other</td>
                                        <td>{stats.byGender.Other}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="report-section">
                            <h3>Age Groups</h3>
                            <table className="stats-table">
                                <tbody>
                                    <tr>
                                        <td>0-18 years</td>
                                        <td>{stats.byAgeGroup['0-18']}</td>
                                    </tr>
                                    <tr>
                                        <td>19-25 years</td>
                                        <td>{stats.byAgeGroup['19-25']}</td>
                                    </tr>
                                    <tr>
                                        <td>26+ years</td>
                                        <td>{stats.byAgeGroup['26+']}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="report-section full-width">
                        <h3>Top Medical Conditions</h3>
                        <table className="stats-table">
                            <thead>
                                <tr>
                                    <th>Condition</th>
                                    <th>Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.topConditions.map(([condition, count], index) => (
                                    <tr key={index}>
                                        <td>{condition}</td>
                                        <td>{count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="report-footer">
                        <p>Prepared by: Iska-Care System</p>
                        <p>Approved by: ____________________</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyReport;
