const SymptomLog = require('../models/symptomLog');

// Create a new symptom log
exports.createSymptomLog = async (req, res) => {
    try {
        console.log('📝 Creating symptom log for user:', req.user._id);
        console.log('📝 Request body:', req.body);
        
        const { timestamp, symptoms, severityRatings } = req.body;
        
        // Basic validation
        if (!timestamp || !symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            console.log('❌ Invalid request data:', { timestamp, symptoms });
            return res.status(400).json({ error: 'Invalid request data' });
        }

        const symptomLog = new SymptomLog({
            userId: req.user._id,
            timestamp,
            symptoms,
            severityRatings
        });

        console.log('📝 Saving symptom log:', symptomLog);
        await symptomLog.save();
        console.log('✅ Symptom log saved successfully');
        res.status(201).json(symptomLog);
    } catch (error) {
        console.error('❌ Error creating symptom log:', error);
        res.status(500).json({ error: 'Failed to create symptom log', details: error.message });
    }
};

// Get symptom logs for a user within a date range
exports.getSymptomLogs = async (req, res) => {
    try {
        console.log('📝 Fetching symptom logs for user:', req.user._id);
        const { startDate, endDate } = req.query;
        console.log('📝 Date range:', { startDate, endDate });
        
        const query = {
            userId: req.user._id
        };

        if (startDate && endDate) {
            query.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        console.log('📝 Query:', query);
        const symptomLogs = await SymptomLog.find(query)
            .sort({ timestamp: -1 })
            .limit(100);

        console.log('✅ Found', symptomLogs.length, 'symptom logs');
        res.json(symptomLogs);
    } catch (error) {
        console.error('❌ Error fetching symptom logs:', error);
        res.status(500).json({ error: 'Failed to fetch symptom logs', details: error.message });
    }
};

// Get a specific symptom log by ID
exports.getSymptomLogById = async (req, res) => {
    try {
        console.log('📝 Fetching symptom log:', req.params.id, 'for user:', req.user._id);
        const symptomLog = await SymptomLog.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!symptomLog) {
            console.log('❌ Symptom log not found');
            return res.status(404).json({ error: 'Symptom log not found' });
        }

        console.log('✅ Symptom log found');
        res.json(symptomLog);
    } catch (error) {
        console.error('❌ Error fetching symptom log:', error);
        res.status(500).json({ error: 'Failed to fetch symptom log', details: error.message });
    }
};

// Delete a symptom log
exports.deleteSymptomLog = async (req, res) => {
    try {
        console.log('📝 Deleting symptom log:', req.params.id, 'for user:', req.user._id);
        const symptomLog = await SymptomLog.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!symptomLog) {
            console.log('❌ Symptom log not found');
            return res.status(404).json({ error: 'Symptom log not found' });
        }

        console.log('✅ Symptom log deleted successfully');
        res.json({ message: 'Symptom log deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting symptom log:', error);
        res.status(500).json({ error: 'Failed to delete symptom log', details: error.message });
    }
}; 