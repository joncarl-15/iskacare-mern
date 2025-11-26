import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Clock, UserCheck } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import './Dashboard.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        inQueue: 0,
        servedToday: 0
    });
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const patientsRes = await axios.get('http://localhost:5000/api/patients');
                const queueRes = await axios.get('http://localhost:5000/api/patients/queue');

                const today = new Date().toDateString();
                const servedToday = patientsRes.data.filter(p =>
                    new Date(p.createdAt).toDateString() === today
                ).length;

                setStats({
                    totalPatients: patientsRes.data.length,
                    inQueue: queueRes.data.length,
                    servedToday
                });

                // Prepare chart data for last 7 days
                const last7Days = [];
                const patientCounts = [];

                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    last7Days.push(dateStr);

                    const count = patientsRes.data.filter(p => {
                        const patientDate = new Date(p.createdAt);
                        return patientDate.toDateString() === date.toDateString();
                    }).length;

                    patientCounts.push(count);
                }

                setChartData({
                    labels: last7Days,
                    datasets: [
                        {
                            label: 'Patients Registered',
                            data: patientCounts,
                            borderColor: 'rgb(220, 53, 69)',
                            backgroundColor: 'rgba(220, 53, 69, 0.1)',
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: 'rgb(220, 53, 69)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                        }
                    ]
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, []);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            title: {
                display: true,
                text: 'Patient Registration Trends (Last 7 Days)',
                font: {
                    size: 16,
                    weight: 'bold'
                },
                color: '#333'
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
                titleFont: {
                    size: 14
                },
                bodyFont: {
                    size: 13
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    color: '#666'
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                ticks: {
                    color: '#666'
                },
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon bg-blue">
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Total Patients</h3>
                        <p>{stats.totalPatients}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-orange">
                        <Clock size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>In Queue</h3>
                        <p>{stats.inQueue}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-green">
                        <UserCheck size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Served Today</h3>
                        <p>{stats.servedToday}</p>
                    </div>
                </div>
            </div>

            {chartData && (
                <div className="chart-container">
                    <Line data={chartData} options={chartOptions} />
                </div>
            )}
        </div>
    );
};

export default Dashboard;
