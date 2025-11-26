const router = require('express').Router();
const Patient = require('../models/Patient');

// ADD PATIENT
router.post('/', async (req, res) => {
    try {
        // Check if Student ID already exists
        const existingPatient = await Patient.findOne({ studentId: req.body.studentId });
        if (existingPatient) {
            return res.status(400).json({
                message: `Student ID '${req.body.studentId}' already exists! Please enter a unique ID.`
            });
        }

        const newPatient = new Patient(req.body);
        const savedPatient = await newPatient.save();
        res.status(200).json(savedPatient);
    } catch (err) {
        if (err.code === 11000) {
            // MongoDB duplicate key error
            return res.status(400).json({
                message: 'Student ID already exists! Please enter a unique ID.'
            });
        }
        res.status(500).json({ message: err.message || 'Error adding patient' });
    }
});

// GET ALL PATIENTS
router.get('/', async (req, res) => {
    try {
        const patients = await Patient.find().sort({ createdAt: -1 });
        res.status(200).json(patients);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET ACTIVE QUEUE (Patients without timeOut)
router.get('/queue', async (req, res) => {
    try {
        const queue = await Patient.find({ timeOut: { $exists: false } }).sort({ createdAt: 1 });
        res.status(200).json(queue);
    } catch (err) {
        res.status(500).json(err);
    }
});

// UPDATE PATIENT (e.g. Discharge/TimeOut)
router.put('/:id', async (req, res) => {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedPatient);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete patient
router.delete('/:id', async (req, res) => {
    try {
        const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
        if (!deletedPatient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json({ message: 'Patient deleted successfully', patient: deletedPatient });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
