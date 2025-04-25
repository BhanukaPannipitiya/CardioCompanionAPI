const express = require('express');
const {
    getAllMedications,
    addMedication,
    deleteMedication,
    toggleMedicationTaken
} = require('../controllers/medicationController');
const protect = require('../middleware/authMiddleware'); // Import default export
const Medication = require('../models/Medication');

const router = express.Router();

// Protect all routes in this file
router.use(protect);

// Base routes
router.route('/')
    .get(getAllMedications)
    .post(addMedication);

// ID-specific routes
router.route('/:id')
    .delete(deleteMedication);

// Toggle taken status
router.route('/:id/toggle-taken')
    .patch(toggleMedicationTaken);

// Get all medications for the authenticated user
router.get('/', async (req, res) => {
    try {
        const medications = await Medication.find({ userId: req.user._id });
        res.json(medications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 