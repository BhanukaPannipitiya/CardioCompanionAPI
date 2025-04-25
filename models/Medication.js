const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dosage: {
        type: String,
        required: false
    },
    schedule: [{
        type: Date,
        required: true
    }],
    takenToday: [{
        date: {
            type: Date,
            required: true
        },
        taken: {
            type: Boolean,
            required: true
        }
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
medicationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Medication', medicationSchema); 