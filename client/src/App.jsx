import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LoginModal from './components/LoginModal';
import MobileMenu from './components/MobileMenu';
import Services from './components/Services';
import StaffLayout from './layouts/StaffLayout';
import Dashboard from './pages/staff/Dashboard';
import AddPatient from './pages/staff/AddPatient';
import ViewPatients from './pages/staff/ViewPatients';
import Queue from './pages/staff/Queue';
import PrintPatients from './pages/staff/PrintPatients';
import MonthlyReport from './pages/staff/MonthlyReport';
import Announcements from './pages/staff/Announcements';
import UserDashboard from './pages/user/UserDashboard';
import ConsultationRequests from './pages/staff/ConsultationRequests';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user || user.role !== 'staff') {
    return <Navigate to="/" />;
  }

  return children;
};

const UserRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user || user.role !== 'user') {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [initialRole, setInitialRole] = useState('user');

  const handleGetStartedClick = () => {
    setInitialRole('user');
    setIsLoginModalOpen(true);
  };

  const handleStaffPortalClick = () => {
    setInitialRole('staff');
    setIsLoginModalOpen(true);
  };

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={
            <div className="app">
              <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
              <main>
                <Hero
                  onLoginClick={handleGetStartedClick}
                  onStaffPortalClick={handleStaffPortalClick}
                />
                <Services />
              </main>
              <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                onLoginClick={() => setIsLoginModalOpen(true)}
              />
              <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                initialRole={initialRole}
              />
            </div>
          } />

          <Route path="/user/dashboard" element={
            <UserRoute>
              <UserDashboard />
            </UserRoute>
          } />

          <Route path="/staff" element={
            <ProtectedRoute>
              <StaffLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="add-patient" element={<AddPatient />} />
            <Route path="view-patients" element={<ViewPatients />} />
            <Route path="queue" element={<Queue />} />
            <Route path="print-patients" element={<PrintPatients />} />
            <Route path="monthly-report" element={<MonthlyReport />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="consultation-requests" element={<ConsultationRequests />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
