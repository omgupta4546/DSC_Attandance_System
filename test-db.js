const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing from .env");
    process.exit(1);
}

console.log("Testing MongoDB Connection...");
console.log("URI:", MONGODB_URI.replace(/:([^:@]+)@/, ':****@')); // Hide password

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log("Successfully connected to MongoDB!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Connection failed:", err);
        process.exit(1);
    });
