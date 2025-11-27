const mongoose = require('mongoose');

const consultationRequestSchema = new mongoose.Schema({
    // Student Information
    name: {
        type: String,
        required: true
    },
    studentId: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other']
    },
    studentCourse: {
        type: String,
        required: true
    },
    studentYear: {
        type: String,
        required: true
    },

    // Medical Information
    condition: {
        type: String,
        required: true
    },
    emergencyStatus: {
        type: String,
        default: 'Non-Emergency',
        enum: ['Emergency', 'Non-Emergency']
    },

    // Request Status
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'approved', 'rejected']
    },

    // Staff Assignment
    assignedNurse: {
        type: String,
        default: ''
    },

    // Additional Notes
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ConsultationRequest', consultationRequestSchema);
