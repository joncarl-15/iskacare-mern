const express = require('express');
const Announcement = require('../models/Announcement');
const router = express.Router();

// Get all active announcements (public)
router.get('/', async (req, res) => {
    try {
        const announcements = await Announcement.find({ isActive: true })
            .sort({ priority: -1, createdAt: -1 })
            .limit(10);
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all announcements (staff only)
router.get('/all', async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new announcement (staff only)
router.post('/', async (req, res) => {
    try {
        const newAnnouncement = new Announcement(req.body);
        const savedAnnouncement = await newAnnouncement.save();
        res.status(201).json(savedAnnouncement);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update announcement
router.put('/:id', async (req, res) => {
    try {
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedAnnouncement);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete announcement
router.delete('/:id', async (req, res) => {
    try {
        const deletedAnnouncement = await Announcement.findByIdAndDelete(req.params.id);
        if (!deletedAnnouncement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }
        res.json({ message: 'Announcement deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
