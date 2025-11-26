import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Users, List, Printer, FileText, LogOut, Menu, X, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './StaffLayout.css';

const StaffLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="staff-layout">
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2>Iska-Care</h2>
                    <p>Staff Portal</p>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/staff/dashboard" className={`nav-item ${isActive('/staff/dashboard') ? 'active' : ''}`} onClick={closeSidebar}>
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link to="/staff/add-patient" className={`nav-item ${isActive('/staff/add-patient') ? 'active' : ''}`} onClick={closeSidebar}>
                        <UserPlus size={20} /> Add Patient
                    </Link>
                    <Link to="/staff/view-patients" className={`nav-item ${isActive('/staff/view-patients') ? 'active' : ''}`} onClick={closeSidebar}>
                        <Users size={20} /> View Patients
                    </Link>
                    <Link to="/staff/queue" className={`nav-item ${isActive('/staff/queue') ? 'active' : ''}`} onClick={closeSidebar}>
                        <List size={20} /> Queue
                    </Link>
                    <Link to="/staff/print-patients" className={`nav-item ${isActive('/staff/print-patients') ? 'active' : ''}`} onClick={closeSidebar}>
                        <Printer size={20} /> Print Patients
                    </Link>
                    <Link to="/staff/monthly-report" className={`nav-item ${isActive('/staff/monthly-report') ? 'active' : ''}`} onClick={closeSidebar}>
                        <FileText size={20} /> Monthly Report
                    </Link>
                    <Link to="/staff/announcements" className={`nav-item ${isActive('/staff/announcements') ? 'active' : ''}`} onClick={closeSidebar}>
                        <Bell size={20} /> Announcements
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <p>Logged in as:</p>
                        <strong>{user?.username}</strong>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

            <main className="staff-content">
                <Outlet />
            </main>
        </div>
    );
};

export default StaffLayout;
