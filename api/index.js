// CardioCompanionAPI/index.js
require('dotenv').config();
const express = require('express');
const connectDB = require('../config/db');
const userRoutes = require('../routes/userRoutes');
const symptomLogRoutes = require('../routes/symptomLogs');
const medicationRoutes = require('../routes/medications');
const appointmentRoutes = require('../routes/appointmentRoutes');
const { notFound, errorHandler } = require('../middleware/errorMiddleware');



const app = express();


connectDB();


app.use(express.json());

// Routes
app.use('/users', userRoutes);
app.use('/api/symptoms', symptomLogRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/appointments', appointmentRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);


if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}


module.exports = app;