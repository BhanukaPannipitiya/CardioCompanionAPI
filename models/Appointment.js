const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Index for faster querying by user
    },
    title: {
        type: String,
        required: [true, 'Appointment title is required.'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Appointment date is required.']
    },
    location: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment; 