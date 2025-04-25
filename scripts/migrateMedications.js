const mongoose = require('mongoose');
const Medication = require('../models/Medication');
require('dotenv').config();

async function migrate() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Drop the medications collection
        await mongoose.connection.db.collection('medications').drop();
        console.log('Dropped medications collection');

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

migrate(); 