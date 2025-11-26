const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    condition: {
        type: String,
        required: true
    },
    dateAdmitted: {
        type: Date,
        default: Date.now
    },
    doctorAssigned: {
        type: String,
        required: true
    },
    timeIn: {
        type: Date
    },
    timeOut: {
        type: Date
    },
    studentId: {
        type: String,
        required: true
    },
    studentCourse: {
        type: String,
        required: true
    },
    studentYear: {
        type: String,
        required: true
    },
    emergencyStatus: {
        type: String,
        enum: ['Non-Emergency', 'Emergency'],
        default: 'Non-Emergency'
    },
    patientType: {
        type: String,
        enum: ['Non-Employee', 'Employee', 'Student'],
        default: 'Non-Employee'
    }
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);
