const express = require('express');
const {
    getAllAppointments,
    createAppointment,
    deleteAppointment
} = require('../controllers/appointmentController');
const protect = require('../middleware/authMiddleware'); // Adjust path if necessary

const router = express.Router();

// Apply protect middleware to all routes in this file
router.use(protect);

// Define routes
router.route('/')
    .get(getAllAppointments)
    .post(createAppointment);

router.route('/:id')
    .delete(deleteAppointment);

module.exports = router; 