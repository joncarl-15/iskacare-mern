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
            const res = await axios.get('http://localhost:5000/api/patients');
            const patients = res.data;

            // Filter for current month (optional, currently doing all time for demo)
            // const currentMonth = new Date().getMonth();
            // const filteredPatients = patients.filter(p => new Date(p.createdAt).getMonth() === currentMonth);

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
        const wb = new ExcelJS.Workbook();

        // Sheet 1: Overview
        const ws1 = wb.addWorksheet('Overview');
        ws1.columns = [
            { header: 'Field', key: 'field', width: 25 },
            { header: 'Value', key: 'value', width: 15 }
        ];
        ws1.addRow({ field: 'Iska-Care Monthly Health Report', value: '' });
        ws1.addRow({ field: '', value: '' });
        ws1.addRow({ field: 'Report Date', value: new Date().toLocaleDateString() });
        ws1.addRow({ field: 'Month/Year', value: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) });
        ws1.addRow({ field: '', value: '' });
        ws1.addRow({ field: 'Total Patients Served', value: stats.totalPatients });

        // Sheet 2: Demographics
        const ws2 = wb.addWorksheet('Demographics');
        ws2.columns = [
            { header: 'Category', key: 'category', width: 15 },
            { header: 'Count', key: 'count', width: 10 }
        ];
        ws2.addRow({ category: 'Gender Distribution', count: '' });
        ws2.addRow({ category: '', count: '' });
        ws2.addRow({ category: 'Gender', count: 'Count' });
        ws2.addRow({ category: 'Male', count: stats.byGender.Male });
        ws2.addRow({ category: 'Female', count: stats.byGender.Female });
        ws2.addRow({ category: 'Other', count: stats.byGender.Other });
        ws2.addRow({ category: '', count: '' });
        ws2.addRow({ category: 'Total', count: stats.byGender.Male + stats.byGender.Female + stats.byGender.Other });

        // Sheet 3: Age Groups
        const ws3 = wb.addWorksheet('Age Groups');
        ws3.columns = [
            { header: 'Age Group', key: 'ageGroup', width: 15 },
            { header: 'Count', key: 'count', width: 10 }
        ];
        ws3.addRow({ ageGroup: 'Age Group Distribution', count: '' });
        ws3.addRow({ ageGroup: '', count: '' });
        ws3.addRow({ ageGroup: 'Age Group', count: 'Count' });
        ws3.addRow({ ageGroup: '0-18 years', count: stats.byAgeGroup['0-18'] });
        ws3.addRow({ ageGroup: '19-25 years', count: stats.byAgeGroup['19-25'] });
        ws3.addRow({ ageGroup: '26+ years', count: stats.byAgeGroup['26+'] });
        ws3.addRow({ ageGroup: '', count: '' });
        ws3.addRow({ ageGroup: 'Total', count: stats.byAgeGroup['0-18'] + stats.byAgeGroup['19-25'] + stats.byAgeGroup['26+'] });

        // Sheet 4: Top Conditions
        const ws4 = wb.addWorksheet('Top Conditions');
        ws4.columns = [
            { header: 'Condition', key: 'condition', width: 30 },
            { header: 'Count', key: 'count', width: 10 }
        ];
        ws4.addRow({ condition: 'Top Medical Conditions', count: '' });
        ws4.addRow({ condition: '', count: '' });
        ws4.addRow({ condition: 'Condition', count: 'Count' });
        stats.topConditions.forEach(([condition, count]) => {
            ws4.addRow({ condition, count });
        });

        // Generate and download
        const buffer = await wb.xlsx.writeBuffer();
        const data = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(data, `Monthly_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
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
