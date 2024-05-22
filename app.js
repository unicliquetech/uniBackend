const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const { errorHandler } = require('./src/utils/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Middleware
app.use(express.json());

// Configure CORS
app.use(cors());

app.set('trust proxy', 1); // Trust the first proxy

// Routes
const authRoutes = require('./src/routes/userAuthRoutes');
const vendorRoutes = require('./src/routes/vendorAuthRoutes');

// Use routes
app.use('/api/v1/user', authRoutes);
app.use('/api/v1/vendor', vendorRoutes);
app.get('/', (req, res)=> {
  res.send('HELLO BACKEND!')
} )

// Global error handling middleware
// app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
