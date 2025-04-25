const express = require('express');
const {
    createSymptomLog,
    getSymptomLogs,
    getSymptomLogById,
    deleteSymptomLog
} = require('../controllers/symptomLogController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
    .post(createSymptomLog)
    .get(getSymptomLogs);

// Get a specific symptom log by ID
router.get('/:id', protect, getSymptomLogById);

// Delete a symptom log
router.delete('/:id', protect, deleteSymptomLog);

module.exports = router; 