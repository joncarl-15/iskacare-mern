import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Ideally verify token with backend, but for now just decode or trust if exists
                    // For better security, add a /me route to backend to validate token
                    const storedUser = JSON.parse(localStorage.getItem('user'));
                    if (storedUser) {
                        setUser(storedUser);
                    }
                } catch (error) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (username, password) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { username, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            return { success: true, user: res.data.user };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const sendVerificationCode = async (email) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/send-verification`, { email });
            return { success: true, expiresIn: res.data.expiresIn };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to send verification code' };
        }
    };

    const verifyCode = async (email, code) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-code`, { email, code });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Invalid verification code' };
        }
    };

    const register = async (email, username, password, role, verificationCode) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                email,
                username,
                password,
                role,
                verificationCode
            });
            return { success: true, user: res.data.user };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, sendVerificationCode, verifyCode, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
