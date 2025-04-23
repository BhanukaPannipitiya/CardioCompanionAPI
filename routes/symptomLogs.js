const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const symptomLogController = require('../controllers/symptomLogController');

// Create a new symptom log
router.post('/', auth, symptomLogController.createSymptomLog);

// Get all symptom logs for the authenticated user
router.get('/', auth, symptomLogController.getSymptomLogs);

// Get a specific symptom log by ID
router.get('/:id', auth, symptomLogController.getSymptomLogById);

// Delete a symptom log
router.delete('/:id', auth, symptomLogController.deleteSymptomLog);

module.exports = router; 