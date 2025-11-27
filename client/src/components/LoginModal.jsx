import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, User, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, initialRole = 'user' }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState(initialRole);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showStaffWarning, setShowStaffWarning] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            setRole(initialRole);
            setIsLogin(true); // Always default to sign-in mode when modal opens
            setShowStaffWarning(false);
        }
    }, [isOpen, initialRole]);

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        // Show warning if user tries to select staff role during registration
        if (!isLogin && newRole === 'staff') {
            setShowStaffWarning(true);
        } else {
            setShowStaffWarning(false);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLogin) {
            const res = await login(username, password);
            if (res.success) {
                // Check if the logged-in user's role matches the selected role
                if (res.user?.role !== role) {
                    alert(`❌ This account is registered as a ${res.user?.role}. Please select the correct role to login.`);
                    logout(); // Logout the user since role doesn't match
                    return;
                }

                onClose();
                if (res.user?.role === 'staff') {
                    navigate('/staff/dashboard');
                } else if (res.user?.role === 'user') {
                    navigate('/user/dashboard');
                }
            } else {
                alert(res.message);
            }
        } else {
            const res = await register(username, password, role);
            if (res.success) {
                // Auto-login after successful registration
                const loginRes = await login(username, password);
                if (loginRes.success) {
                    onClose();
                    if (loginRes.user?.role === 'staff') {
                        navigate('/staff/dashboard');
                    } else if (loginRes.user?.role === 'user') {
                        navigate('/user/dashboard');
                    }
                } else {
                    alert('Registration successful! Please login.');
                    setIsLogin(true);
                }
            } else {
                alert(res.message);
            }
        }
    };

    return (
        <AnimatePresence>
            <div className="modal-overlay" onClick={onClose}>
                <motion.div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                >
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>

                    <div className="modal-header">
                        <h2>{isLogin ? 'Welcome Back' : 'Join Iska-Care'}</h2>
                        <p>{isLogin ? 'Please enter your details to sign in.' : 'Create an account to get started.'}</p>
                    </div>

                    <div className="role-switch">
                        <button
                            className={`role-btn ${role === 'user' ? 'active' : ''}`}
                            onClick={() => handleRoleChange('user')}
                        >
                            <User size={18} />
                            User
                        </button>
                        <button
                            className={`role-btn ${role === 'staff' ? 'active' : ''}`}
                            onClick={() => handleRoleChange('staff')}
                        >
                            <Briefcase size={18} />
                            Staff
                        </button>
                    </div>

                    {showStaffWarning && (
                        <div className="staff-warning">
                            <p>⚠️ Staff registration requires authorization. Please contact the administrator if you need staff access.</p>
                        </div>
                    )}

                    <div className="form-container">
                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="submit-btn">
                                {isLogin ? 'Sign In' : 'Sign Up'}
                            </button>
                        </form>
                    </div>

                    <div className="modal-footer">
                        <p>
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button onClick={() => { setIsLogin(!isLogin); setShowStaffWarning(false); }} className="toggle-auth-btn">
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LoginModal;
