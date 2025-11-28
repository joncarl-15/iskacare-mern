const express = require('express');
const router = express.Router();
const Message = require('../models/message.model');
const User = require('../models/User');

// Send a message
router.post('/', async (req, res) => {
    try {
        const { sender, receiver, content } = req.body;
        const message = new Message({
            sender,
            receiver,
            content
        });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get messages between a user and staff (or specific receiver)
// If receiver is 'staff', we look for messages where (sender=userId AND receiver=null) OR (sender=staffId AND receiver=userId)
// For simplicity, let's assume:
// User -> Staff: receiver is null
// Staff -> User: receiver is User
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: null }, // User sent to staff
                { receiver: userId } // Staff sent to user
            ]
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all conversations for staff
// Returns list of users who have messages
router.get('/staff/conversations', async (req, res) => {
    try {
        // Find all messages where receiver is null (sent by users to staff)
        // or receiver is a user (sent by staff to users - though we mainly care about users initiating or being active)
        const messages = await Message.find({}).populate('sender', 'username email').populate('receiver', 'username email').sort({ createdAt: -1 });

        // Group by user
        const conversations = {};
        messages.forEach(msg => {
            let otherUser;
            if (!msg.receiver) {
                // User -> Staff
                otherUser = msg.sender;
            } else {
                // Staff -> User
                otherUser = msg.receiver;
            }

            if (otherUser && !conversations[otherUser._id]) {
                conversations[otherUser._id] = {
                    user: otherUser,
                    lastMessage: msg
                };
            }
        });

        res.json(Object.values(conversations));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
