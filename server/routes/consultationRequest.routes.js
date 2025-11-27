const express = require('express');
const router = express.Router();
const ConsultationRequest = require('../models/consultationRequest.model');
const Patient = require('../models/Patient');

// Create new consultation request
router.post('/', async (req, res) => {
    try {
        const consultationRequest = new ConsultationRequest(req.body);
        await consultationRequest.save();
        res.status(201).json(consultationRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all consultation requests
router.get('/', async (req, res) => {
    try {
        const requests = await ConsultationRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get requests by student ID
router.get('/user/:studentId', async (req, res) => {
    try {
        const requests = await ConsultationRequest.find({
            studentId: req.params.studentId
        }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get count of pending requests
router.get('/pending/count', async (req, res) => {
    try {
        const count = await ConsultationRequest.countDocuments({ status: 'pending' });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Approve consultation request and add to queue
router.put('/:id/approve', async (req, res) => {
    try {
        const request = await ConsultationRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Update request status
        request.status = 'approved';
        request.assignedNurse = req.body.assignedNurse || 'Staff';
        await request.save();

        // Create patient entry in queue
        const patient = new Patient({
            name: request.name,
            age: request.age,
            gender: request.gender,
            studentId: request.studentId,
            studentCourse: request.studentCourse,
            studentYear: request.studentYear,
            condition: request.condition,
            emergencyStatus: request.emergencyStatus,
            doctorAssigned: request.assignedNurse,
            patientType: 'Student',
            timeIn: new Date(),
            status: 'In Queue'
        });

        await patient.save();

        res.json({
            message: 'Request approved and patient added to queue',
            request,
            patient
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Reject consultation request
router.put('/:id/reject', async (req, res) => {
    try {
        const request = await ConsultationRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        request.status = 'rejected';
        request.notes = req.body.notes || '';
        await request.save();

        res.json({
            message: 'Request rejected',
            request
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
