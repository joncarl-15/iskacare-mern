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
app.use(cors());
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

app.get('/', (req, res) => {
    res.send('Iska-Care API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
