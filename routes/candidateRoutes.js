const express = require('express');
const router = express.Router();
const User = require('./../models/candidate');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');
const Candidate = require('../models/candidate');

// Function to check xif the user is an admin
const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        return user.role === 'admin';
    } catch (err) {
        return false;
    }
};

// Route to add a candidate (admin only)
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin)
            return res.status(403).json({ message: "User does not have admin privileges" });

        const data = req.body; // Assuming request body contains the candidate data
        const newCandidate = new Candidate(data); // Create a new user document using the mongoose model
        const response = await newCandidate.save(); // Save new user to the database
        console.log('Data saved');
        res.status(200).json({ response: response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to update user password (admin only)
router.put('/update-password/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin)
            return res.status(403).json({ message: "User does not have admin privileges" });

        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        user.password = newPassword;
        await user.save();
        
        console.log('Password updated');
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route to delete a candidate (admin only)
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin)
            return res.status(403).json({ message: "User does not have admin privileges" });

        const candidateID = req.params.candidateID;
        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        console.log('Candidate deleted');
        res.status(200).json({ message: 'Candidate deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
//lets start voting
// Route to handle voting
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    const candidateId = req.params.candidateID;
    const userId = req.user.id;

    try {
        // Find the candidate document by ID
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user has already voted
        if (user.isVoted) {
            return res.status(400).json({ message: "You have already voted" });
        }

        // Check if the user is an admin (admins cannot vote)
        if (user.role === 'admin') {
            return res.status(403).json({ message: "Admins are not allowed to vote" });
        }

        // Record the vote by updating the candidate document
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        // Mark the user as having voted
        user.isVoted = true;
        await user.save();

        console.log('Vote recorded');
        res.status(200).json({ message: "Vote recorded successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
//to find vote count means how many votes get by party
//get the votes in sorted order
router.get('/vote/count',async(req,res)=>{
    try{
        //find the candidate and sort thenm by voteCount descending order
        const candidate = await Candidate.find().sort({voteCount:'desc'});
        //map the candidate and only return their name and vote count
        const voteRecord = candidate.map((data)=>{
            return{
                party:data.party,
                count:data.voteCount
            }
        });
        return res.status(200).json(voteRecord);

    }
    catch{
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
});    
    


module.exports = router;


module.exports = router;
