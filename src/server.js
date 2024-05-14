const app = require('./app');
const connectDB = require('./config/database');
const { PORT } = require('./config/env');

// Connect to MongoDB
connectDB();

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});