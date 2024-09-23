const mongoose = require('mongoose');

// Define the MongoDB connection URL
const mongoURL = 'mongodb://localhost:27017/vote';
//const mongoURL= 'mongodb+srv://yrajpoot648:Qwerty1234@cluster0.2yqno.mongodb.net/'

// Set up MongoDB connection
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Get the default connection
const db = mongoose.connection;

// Define event listeners
db.on('connected', () => {
    console.log("Connected to MongoDB Server");
});

db.on('error', (err) => {
    console.error("Connection Error:", err);
});

db.on('disconnected', () => {
    console.log("Disconnected from MongoDB Server");
});

// Export the database connection
module.exports = db;
