const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/userModel');
const { validateEmail, validatePassword } = require('../utils/userValidators');
const nodemailer = require('nodemailer');


// Send verification email
const sendVerificationEmail = async (email, firstName, otp) => {
  try {
    // Configure email transport settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Email Verification',
      html: `<p>Dear ${firstName},</p>
             <p>Your OTP to verify your email address is:${otp}"</p>`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

// Passport Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        // Find the user by email
        const user = await User.findOne({ email });

        console.log('User found:', user);

        // If no user is found, return false
        if (!user) {
          return done(null, false, { message: 'Invalid email' });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid password' });
        }

        // Check if the user is verified
        if (user.otp !== null) {
          return done(null, false, { message: 'Please verify your email' });
        }

        // Return the user object on successful authentication
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Register and Authenticate a user and generate a JWT
const login = async (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json(info);
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ msg: `Welcome back, ${user.firstName}`, token });
  })(req, res, next);
};

// Register a new user
const registerUser = async (req, res, next) => {
  const { firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body;
  
  try {
    // Validate input
    const isValidEmail = validateEmail(email);
    const isValidPassword = validatePassword(password);
    const isValidConfirmPassword = validatePassword(confirmPassword);

    if (!isValidEmail || !isValidPassword || !isValidConfirmPassword) {
      return res.status(400).json({ msg: 'Invalid input' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: 'Passwords do not match' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Generate an OTP
    const generateOTP = () => {
      const otp = Math.floor(10000 + Math.random() * 90000);
      return otp.toString();
    };
    
    const otp = generateOTP();

   // Set the OTP expiration time (4 minutes from now)
   const otpExpires = new Date(Date.now() + 4 * 60 * 1000);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user with the verification token and hashed password
    const newUser = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword, 
      otp,
      otpExpires,
      isVerified: false,
    });

     // Save the new user
     const savedUser = await newUser.save();

    // Send verification email
    sendVerificationEmail(email, firstName, otp);

    res.status(201).json({ msg: 'Verification email sent' });
  } catch (err) {
    next(err);
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;

     // Find the vendor by the OTP
     const user = await User.findOne({ otp });

     if (!user) {
       return res.status(400).json({ error: 'Invalid OTP' });
     }

    // Check if the OTP has expired
    const currentTime = new Date();
    if (currentTime > user.otpExpires) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Mark the vendor as verified and remove the verification otp and otpExpires
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Reset Password Email
const resetPasswordEmail = async (req, res, next) => {
  const { email } = req.body;
  try {
    // Validate email
    const isValidEmail = validateEmail(email);
    if (!isValidEmail) {
      return res.status(400).json({ msg: 'Invalid email' });
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Generate an OTP
    const generateOTP = () => {
      const otp = Math.floor(10000 + Math.random() * 90000);
      return otp.toString();
    };
    
    const resetOtp = generateOTP();

   // Set the OTP expiration time (4 minutes from now)
   const otpExpires = new Date(Date.now() + 4 * 60 * 1000);

   // Save the reset token to the user's document
   user.resetOtp = resetOtp;
   user.otpExpires = otpExpires;
   await user.save();

    // Send the password reset email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        },
      });
  
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Password Reset',
        html: `<p>You have requested a password reset. Your OTP for email reset is: <strong>${resetOtp}</strong></p>`,
      };
  
      await transporter.sendMail(mailOptions);
      res.json({ msg: 'Password reset email sent' });
    } catch (err) {
      next(err);
    }
  };
  
  // Reset Password POST Route
  const postResetPassword = async (req, res, next) => {
    const { resetOtp, password, confirmPassword } = req.body;
    try {
      // Check if the reset otp is valid
      const user = await User.findOne({ resetOtp: resetOtp });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid OTP' });
      }
  
      // Check if the OTP has expired
      const currentTime = new Date();
      if (currentTime > user.otpExpires) {
        return res.status(400).json({ error: 'OTP has expired' });
      }
  
      // Validate the new password
      if (password !== confirmPassword) {
        return res.status(400).json({ msg: 'Passwords do not match' });
      }
  
      // Generate a new salt and hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Update the user's password and remove the reset token
      user.password = hashedPassword;
      user.otp = null;
      user.otpExpires = null;
      await user.save();
  
      res.json({ msg: 'Password reset successfully' });
    } catch (err) {
      next(err);
    }
  };
  
  // Update Password
  const updatePassword = async (req, res, next) => {
    const { email, resetOtp, newPassword, confirmPassword } = req.body;
  
    try {
      // Validate input
      const isValidEmail = validateEmail(email);
      const isValidPassword = validatePassword(newPassword);
      const isValidConfirmPassword = validatePassword(confirmPassword);
      if (!isValidEmail || !isValidPassword || !isValidConfirmPassword) {
        return res.status(400).json({ msg: 'Invalid input' });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ msg: 'Passwords do not match' });
      }
  
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      // Verify the reset token and expiration time
      if (!user.resetOtp || user.resetOtp !== resetOtp || Date.now() > user.otpExpires) {
        return res.status(400).json({ msg: 'Invalid or expired otp' });
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update the user's password and reset token
      user.password = hashedPassword;
      user.resetOtp = null;
      user.otpExpires = null;
      await user.save();
  
      res.json({ msg: 'Password updated successfully' });
    } catch (err) {
      next(err);
    }
  };
  
  // Logout
  const logoutUser = async (req, res, next) => {
    try {
      // Clear the JWT token from the client
      res.clearCookie('token');
  
      res.json({ msg: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  };
  
  // Resend OTP
  const resendOTP = async (req, res) => {
    try {
      const { email } = req.body;
  
      // Find the user by email
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Generate a new OTP
      const generateOTP = () => {
        const otp = Math.floor(10000 + Math.random() * 90000);
        return otp.toString();
      };
      const newOTP = generateOTP();
  
      // Set the new OTP and OTP expiration time (4 minutes from now)
      user.otp = newOTP;
      const otpExpires = new Date(Date.now() + 4 * 60 * 1000);
      user.otpExpires = otpExpires;
  
      // Save the updated user document
      await user.save();
  
      // Send the new OTP to the user's email
      const { firstName } = user;
      sendVerificationEmail(email, firstName, newOTP);
  
      res.status(200).json({ message: 'New OTP sent successfully' });
    } catch (error) {
      console.error('Error resending OTP:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };


  module.exports = { 
    login,
    registerUser,
    verifyEmail,
    resetPasswordEmail,
    updatePassword,
    resendOTP,
    logoutUser
   };