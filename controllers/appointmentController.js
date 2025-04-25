const Appointment = require('../models/Appointment');

// @desc    Get all appointments for the logged-in user
// @route   GET /api/appointments
// @access  Private
exports.getAllAppointments = async (req, res) => {
    try {
        // req.user is added by the authMiddleware
        const appointments = await Appointment.find({ userId: req.user.id }).sort({ date: 1 }); // Sort by date ascending
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
};

// @desc    Create a new appointment for the logged-in user
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
    try {
        const { title, date, location, notes } = req.body;
        
        // Basic validation
        if (!title || !date) {
            return res.status(400).json({ message: 'Title and date are required' });
        }

        const newAppointment = new Appointment({
            userId: req.user.id, // Attach the logged-in user's ID
            title,
            date,
            location,
            notes
        });

        const savedAppointment = await newAppointment.save();
        res.status(201).json(savedAppointment);
    } catch (error) {
        console.error('Error creating appointment:', error);
         // Handle validation errors specifically if needed
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating appointment', error: error.message });
    }
};

// @desc    Delete an appointment by ID for the logged-in user
// @route   DELETE /api/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify the appointment belongs to the logged-in user
        if (appointment.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to delete this appointment' });
        }

        await appointment.deleteOne(); // Use deleteOne on the document instance

        res.status(204).send(); // 204 No Content for successful deletion
    } catch (error) {
        console.error('Error deleting appointment:', error);
         // Handle invalid ObjectId format
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid appointment ID format' });
        }
        res.status(500).json({ message: 'Error deleting appointment', error: error.message });
    }
}; 