const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    isUrgent: {
        type: Boolean,
        default: false
    }
});

const symptomLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    symptoms: [symptomSchema],
    severityRatings: {
        type: Map,
        of: Number,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient querying by user and date
symptomLogSchema.index({ userId: 1, timestamp: -1 });

// Check if the model already exists before creating it
const SymptomLog = mongoose.models.SymptomLog || mongoose.model('SymptomLog', symptomLogSchema);

module.exports = SymptomLog; 