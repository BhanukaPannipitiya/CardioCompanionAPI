const Medication = require('../models/Medication');

// @desc    Get all medications for the logged-in user
// @route   GET /api/medications
// @access  Private
exports.getAllMedications = async (req, res) => {
    try {
        console.log(' Fetching medications for user:', req.user._id);
        const medications = await Medication.find({ userId: req.user._id });
        console.log('Found', medications.length, 'medications');
        res.json(medications);
    } catch (error) {
        console.error(' Error fetching medications:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new medication
// @route   POST /api/medications
// @access  Private
exports.addMedication = async (req, res) => {
    try {
        console.log(' Adding new medication for user:', req.user._id);
        console.log(' Request body:', req.body);

        const medication = new Medication({
            _id: req.body._id, // Use _id from request body
            name: req.body.name,
            dosage: req.body.dosage,
            schedule: req.body.schedule,
            takenToday: req.body.takenToday || [],
            userId: req.user._id
        });

        const newMedication = await medication.save();
        console.log(' Medication added successfully:', newMedication._id);
        res.status(201).json(newMedication);
    } catch (error) {
        console.error(' Error adding medication:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a medication
// @route   DELETE /api/medications/:id
// @access  Private
exports.deleteMedication = async (req, res) => {
    try {
        console.log('🗑️ Deleting medication:', req.params.id);
        const medication = await Medication.findOne({ 
            _id: req.params.id,
            userId: req.user._id 
        });

        if (!medication) {
            console.log(' Medication not found');
            return res.status(404).json({ message: 'Medication not found' });
        }

        await medication.deleteOne();
        console.log(' Medication deleted successfully');
        res.status(204).send();
    } catch (error) {
        console.error(' Error deleting medication:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle medication taken status
// @route   PATCH /api/medications/:id/toggle-taken
// @access  Private
exports.toggleMedicationTaken = async (req, res) => {
    try {
        const { scheduleTime, isTaken } = req.body;
        console.log(' Toggling medication taken status:', {
            medicationId: req.params.id,
            scheduleTime,
            isTaken
        });

        const medication = await Medication.findOne({ 
            _id: req.params.id,
            userId: req.user._id 
        });
        
        if (!medication) {
            console.log(' Medication not found');
            return res.status(404).json({ message: 'Medication not found' });
        }

        // Find or create the takenToday entry
        const date = new Date(scheduleTime);
        const existingEntry = medication.takenToday.find(entry => 
            entry.date.getTime() === date.getTime()
        );

        if (existingEntry) {
            console.log(' Updating existing entry');
            existingEntry.taken = isTaken;
        } else {
            console.log(' Creating new entry');
            medication.takenToday.push({ date, taken: isTaken });
        }

        const updatedMedication = await medication.save();
        console.log(' Medication status updated successfully');
        res.json(updatedMedication);
    } catch (error) {
        console.error(' Error toggling medication status:', error);
        res.status(500).json({ message: error.message });
    }
}; 