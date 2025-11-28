import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { X, User, Briefcase, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, initialRole = 'user' }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [role, setRole] = useState(initialRole);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showStaffWarning, setShowStaffWarning] = useState(false);

    // Registration/Reset steps: 1=Email, 2=Verification, 3=Details/NewPassword
    const [step, setStep] = useState(1);
    const [timeLeft, setTimeLeft] = useState(0);
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login, register, sendVerificationCode, verifyCode } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            setRole(initialRole);
            setIsLogin(true);
            setIsForgotPassword(false);
            setShowStaffWarning(false);
            resetForm();
        }
    }, [isOpen, initialRole]);

    useEffect(() => {
        let timer;
        if (timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && step === 2) {
            setCanResend(true);
        }
        return () => clearInterval(timer);
    }, [timeLeft, step]);

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setEmail('');
        setVerificationCode('');
        setNewPassword('');
        setStep(1);
        setTimeLeft(0);
        setCanResend(false);
        setLoading(false);
    };

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        if (!isLogin && newRole === 'staff') {
            setShowStaffWarning(true);
        } else {
            setShowStaffWarning(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Registration Code Flow
    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await sendVerificationCode(email);
        setLoading(false);
        if (res.success) {
            setStep(2);
            setTimeLeft(res.expiresIn || 600);
            setCanResend(false);
            alert('Verification code sent to your email!');
        } else {
            alert(res.message);
        }
    };

    // Forgot Password Flow
    const handleSendResetCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
            setStep(2);
            setTimeLeft(res.data.expiresIn || 600);
            setCanResend(false);
            alert('Password reset code sent to your email!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await verifyCode(email, verificationCode);
        setLoading(false);
        if (res.success) {
            setStep(3);
            alert('Email verified successfully!');
        } else {
            alert(res.message);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-reset-code`, {
                email,
                code: verificationCode,
                newPassword
            });
            alert('Password reset successfully! Please login with your new password.');
            setIsForgotPassword(false);
            setIsLogin(true);
            resetForm();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setLoading(true);
        if (isForgotPassword) {
            try {
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
                setTimeLeft(res.data.expiresIn || 600);
                setCanResend(false);
                alert('New reset code sent!');
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to resend code');
            }
        } else {
            const res = await sendVerificationCode(email);
            if (res.success) {
                setTimeLeft(res.expiresIn || 600);
                setCanResend(false);
                alert('New verification code sent!');
            } else {
                alert(res.message);
            }
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (isLogin) {
            const res = await login(username, password);
            if (res.success) {
                if (res.user?.role !== role) {
                    alert(`❌ This account is registered as a ${res.user?.role}. Please select the correct role to login.`);
                    setLoading(false);
                    return;
                }
                onClose();
                navigate(res.user?.role === 'staff' ? '/staff/dashboard' : '/user/dashboard');
            } else {
                alert(res.message);
            }
        } else {
            const res = await register(email, username, password, role, verificationCode);
            if (res.success) {
                const loginRes = await login(username, password);
                if (loginRes.success) {
                    onClose();
                    navigate(loginRes.user?.role === 'staff' ? '/staff/dashboard' : '/user/dashboard');
                } else {
                    alert('Registration successful! Please login.');
                    setIsLogin(true);
                }
            } else {
                alert(res.message);
            }
        }
        setLoading(false);
    };

    if (!isOpen) return null;

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
                        <h2>
                            {isForgotPassword ? 'Reset Password' :
                                isLogin ? 'Welcome Back' : 'Join Iska-Care'}
                        </h2>
                        <p>
                            {isForgotPassword ?
                                (step === 1 ? 'Enter your email to receive a reset code.' :
                                    step === 2 ? 'Enter the code sent to your email.' :
                                        'Create your new password.') :
                                isLogin ? 'Please enter your details to sign in.' :
                                    step === 1 ? 'Enter your email to get started.' :
                                        step === 2 ? 'Enter the code sent to your email.' :
                                            'Create your username and password.'}
                        </p>
                    </div>

                    {!isForgotPassword && (
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
                    )}

                    {showStaffWarning && !isForgotPassword && (
                        <div className="staff-warning">
                            <p>⚠️ Staff registration requires authorization. Please contact the administrator if you need staff access.</p>
                        </div>
                    )}

                    <div className="form-container">
                        {isForgotPassword ? (
                            <div className="forgot-password-flow">
                                {step === 1 && (
                                    <form onSubmit={handleSendResetCode}>
                                        <div className="input-group">
                                            <label>Email Address</label>
                                            <input
                                                type="email"
                                                placeholder="Enter your registered email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="submit-btn" disabled={loading}>
                                            {loading ? 'Sending...' : 'Send Reset Code'}
                                        </button>
                                        <button
                                            type="button"
                                            className="back-to-login-btn"
                                            onClick={() => {
                                                setIsForgotPassword(false);
                                                setIsLogin(true);
                                                resetForm();
                                            }}
                                        >
                                            <ArrowLeft size={16} /> Back to Login
                                        </button>
                                    </form>
                                )}

                                {step === 2 && (
                                    <form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                                        <div className="input-group">
                                            <label>Verification Code</label>
                                            <input
                                                type="text"
                                                placeholder="Enter 6-digit code"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                maxLength={6}
                                                required
                                                className="code-input"
                                            />
                                        </div>
                                        <div className="timer-container">
                                            {timeLeft > 0 ? (
                                                <p className="timer">Code expires in: {formatTime(timeLeft)}</p>
                                            ) : (
                                                <p className="timer expired">Code expired</p>
                                            )}
                                            {canResend && (
                                                <button type="button" onClick={handleResendCode} className="resend-btn">
                                                    Resend Code
                                                </button>
                                            )}
                                        </div>
                                        <button type="submit" className="submit-btn">Verify Code</button>
                                        <button type="button" onClick={() => setStep(1)} className="back-btn">
                                            Change Email
                                        </button>
                                    </form>
                                )}

                                {step === 3 && (
                                    <form onSubmit={handleResetPassword}>
                                        <div className="input-group">
                                            <label>New Password</label>
                                            <input
                                                type="password"
                                                placeholder="Enter new password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                        <button type="submit" className="submit-btn" disabled={loading}>
                                            {loading ? 'Resetting...' : 'Reset Password'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        ) : isLogin ? (
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
                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="forgot-password-link"
                                        onClick={() => {
                                            setIsForgotPassword(true);
                                            setIsLogin(false);
                                            resetForm();
                                        }}
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </button>
                            </form>
                        ) : (
                            <div className="registration-steps">
                                {step === 1 && (
                                    <form onSubmit={handleSendCode}>
                                        <div className="input-group">
                                            <label>Email Address</label>
                                            <input
                                                type="email"
                                                placeholder="Enter your email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="submit-btn" disabled={loading}>
                                            {loading ? 'Sending...' : 'Send Verification Code'}
                                        </button>
                                    </form>
                                )}

                                {step === 2 && (
                                    <form onSubmit={handleVerifyCode}>
                                        <div className="input-group">
                                            <label>Verification Code</label>
                                            <input
                                                type="text"
                                                placeholder="Enter 6-digit code"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                maxLength={6}
                                                required
                                                className="code-input"
                                            />
                                        </div>
                                        <div className="timer-container">
                                            {timeLeft > 0 ? (
                                                <p className="timer">Code expires in: {formatTime(timeLeft)}</p>
                                            ) : (
                                                <p className="timer expired">Code expired</p>
                                            )}
                                            {canResend && (
                                                <button type="button" onClick={handleResendCode} className="resend-btn">
                                                    Resend Code
                                                </button>
                                            )}
                                        </div>
                                        <button type="submit" className="submit-btn" disabled={loading}>
                                            {loading ? 'Verifying...' : 'Verify Code'}
                                        </button>
                                        <button type="button" onClick={() => setStep(1)} className="back-btn">
                                            Change Email
                                        </button>
                                    </form>
                                )}

                                {step === 3 && (
                                    <form onSubmit={handleSubmit}>
                                        <div className="input-group">
                                            <label>Username</label>
                                            <input
                                                type="text"
                                                placeholder="Choose a username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Password</label>
                                            <input
                                                type="password"
                                                placeholder="Choose a password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="submit-btn" disabled={loading}>
                                            {loading ? 'Registering...' : 'Complete Registration'}
                                        </button>
                                    </form>
                                )}

                                <div className="step-indicators">
                                    <div className={`step-dot ${step >= 1 ? 'active' : ''}`}></div>
                                    <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                                    <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
                                    <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
                                    <div className={`step-dot ${step >= 3 ? 'active' : ''}`}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {!isForgotPassword && (
                        <div className="modal-footer">
                            <p>
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button onClick={() => {
                                    setIsLogin(!isLogin);
                                    setShowStaffWarning(false);
                                    resetForm();
                                }} className="toggle-auth-btn">
                                    {isLogin ? 'Sign Up' : 'Sign In'}
                                </button>
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LoginModal;
