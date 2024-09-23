const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

// Signup Route
router.post('/signup', async (req, res) => {
    try {
        const data = req.body; // Assuming request body contains the user data
        // Create a new user document using the mongoose model
        const newUser = new User(data);
        // Save new user to the database
        const response = await newUser.save();
        console.log('Data saved');
        
        const payload = {  // Fixed the syntax
            id: response.id
        };
        console.log(JSON.stringify(payload));
        
        const token = generateToken(payload);
        console.log("Token is: ", token);
        
        res.status(200).json({ response, token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        // Extract aadharCardNumber and password from request body
        const { aadharCardNumber, password } = req.body;
        // Find user by aadharCardNumber
        const user = await User.findOne({ aadharCardNumber });
        
        // If user does not exist or password does not match, return error
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        
        // Generate token
        const payload = { id: user.id };
        const token = generateToken(payload);
        
        // Return token as response
        res.json({ token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Profile Route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Extract the user ID from the token
        const user = await User.findById(userId);
        res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Password Change Route
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Extract the ID from the token
        const { currentPassword, newPassword } = req.body; // Extract the current and new password from request body
        
        // Find the user by userId
        const user = await User.findById(userId);
        
        // If current password does not match, return error
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid current password' });
        }
        
        // Change password (this will trigger the pre-save hook to hash the password)
        user.password = newPassword;
        await user.save();
        
        console.log('Password updated');
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
