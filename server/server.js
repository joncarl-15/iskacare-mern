const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const authRoute = require('./routes/auth');
const patientRoute = require('./routes/patients');
const announcementRoute = require('./routes/announcements');
const consultationRequestRoute = require('./routes/consultationRequest.routes');

// Middleware
app.use(cors({
    origin: ["https://iskacare.vercel.app", "http://localhost:5173", "http://localhost:3000"], // Add your frontend URL here
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoute);
app.use('/api/patients', patientRoute);
app.use('/api/announcements', announcementRoute);
app.use('/api/consultation-requests', consultationRequestRoute);
app.use('/api/messages', require('./routes/message.routes'));

app.get('/', (req, res) => {
    res.send('Iska-Care API is running');
});

// Diagnostic Endpoint
app.get('/api/debug', async (req, res) => {
    const { verifyConnection } = require('./services/emailService');

    // Test Email Connection
    let emailStatus = { success: false, error: 'Not tested' };
    try {
        emailStatus = await verifyConnection();
    } catch (e) {
        emailStatus = { success: false, error: e.message };
    }

    const report = {
        mongo: {
            status: mongoose.connection.readyState === 1 ? 'Connected' :
                mongoose.connection.readyState === 2 ? 'Connecting' : 'Disconnected',
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host
        },
        email: emailStatus,
        env: {
            hasMongoUri: !!process.env.MONGO_URI,
            hasEmailUser: !!process.env.EMAIL_USER,
            hasEmailPass: !!process.env.EMAIL_PASS
        }
    };

    try {
        // Test DB Read
        if (mongoose.connection.readyState === 1) {
            const collections = await mongoose.connection.db.listCollections().toArray();
            report.mongo.collections = collections.map(c => c.name);
        }
    } catch (err) {
        report.mongo.error = err.message;
    }

    res.json(report);
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
