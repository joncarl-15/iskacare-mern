const nodemailer = require('nodemailer');

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Email service error:', error);
    } else {
        console.log('✅ Email service is ready to send messages');
    }
});

/**
 * Send verification code to user's email
 * @param {string} email - Recipient email address
 * @param {string} code - 6-digit verification code
 * @returns {Promise} - Promise resolving to send result
 */
const sendVerificationEmail = async (email, code) => {
    try {
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM || 'Iska-Care'}" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Iska-Care - Email Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <p>Dear User,</p>
                    <p>Thank you for registering with Iska-Care.</p>
                    <p>Your verification code is: <strong style="font-size: 1.2em;">${code}</strong></p>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you did not request this code, please ignore this email.</p>
                    <br>
                    <p>Sincerely,</p>
                    <p><strong>Team Creative Code</strong></p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending verification email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send password reset code to user's email
 * @param {string} email - Recipient email address
 * @param {string} code - 6-digit verification code
 * @returns {Promise} - Promise resolving to send result
 */
const sendPasswordResetEmail = async (email, code) => {
    try {
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM || 'Iska-Care'}" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Iska-Care - Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <p>Dear User,</p>
                    <p>We received a request to reset your password for your Iska-Care account.</p>
                    <p>Your password reset code is: <strong style="font-size: 1.2em;">${code}</strong></p>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you did not request a password reset, please ignore this email.</p>
                    <br>
                    <p>Sincerely,</p>
                    <p><strong>Team Creative Code</strong></p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
};
