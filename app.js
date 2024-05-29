const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const handleTokenExpiration = require('./src/middleware/handleTokenexpiration');
const authMiddleware = require('./src/middleware/authMiddleware');
const { errorHandler } = require('./src/utils/errorHandler');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const rateLimiter = require('express-rate-limit');
const helmet  = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');

// USE V2
const cloudinary = require('cloudinary').v2;


// Load environment variables
dotenv.config();

// load cloudinary
cloudinary.config({
  path: "./config/config.env",
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const app = express();
app.use(express.json());
app.use(cors());
// Configure cookie-parser middleware
app.use(cookieParser(process.env.JWT_SECRET));
// Configure express-session middleware
app.use(
  session({
    secret: 'ycfw729910jhy&^%£GCXD143ft42((DRfr3Frk8', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } // Set secure to true if using HTTPS
  })
);
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

// middleware
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(fileUpload({ useTempFiles: true }));
// app.use(handleTokenExpiration);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));



app.set('trust proxy', 1); // Trust the first proxy

// Routes
const authRoutes = require('./src/routes/userAuthRoutes');
const vendorRoutes = require('./src/routes/vendorAuthRoutes');
const cartRoutes = require('./src/routes/cartRoute');
const productsRoutes = require('./src/routes/productsRoutes');
const addressRoutes = require('./src/routes/addressRoutes');

// Use routes
app.use('/api/v1/user', authRoutes);
app.use('/api/v1/vendor', vendorRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/address', addressRoutes);
app.get('/', (req, res)=> {
  res.send('HELLO BACKEND!')
} )

// Global error handling middleware
// app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
