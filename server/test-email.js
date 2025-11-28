require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log('📧 Testing Email Configuration...');
    console.log(`User: ${process.env.EMAIL_USER}`);
    // Don't log the full password for security, just length
    console.log(`Pass: ${process.env.EMAIL_PASS ? '******** (' + process.env.EMAIL_PASS.length + ' chars)' : 'Not Set'}`);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        console.log('Attempting to verify transporter connection...');
        await transporter.verify();
        console.log('✅ Transporter connection successful!');

        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'IskaCare Test Email',
            text: 'If you receive this, your email configuration is working correctly!'
        });

        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Error Details:');
        console.error(error);

        if (error.code === 'EAUTH') {
            console.log('\n💡 TIP: Authentication failed. Make sure:');
            console.log('1. You are using the correct email address.');
            console.log('2. You are using an APP PASSWORD, not your login password.');
            console.log('3. 2-Step Verification is enabled on your Google Account.');
        }
    }
};

testEmail();
