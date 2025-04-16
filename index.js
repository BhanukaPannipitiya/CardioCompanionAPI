// CardioCompanionAPI/index.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

// Debug: Print environment variables
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'Set' : 'Not set');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});