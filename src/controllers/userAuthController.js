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
        console.log('User email:', email);
        console.log('User password:', password);
        // Find the user by email
        const user = await User.findOne({ email });

        console.log('User found:', user);

        // If no user is found, return false
        if (!user) {
          console.log(user);
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


// Register a new user
const registerUser = async (req, res, next) => {
  console.log("received");
  const { firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body;
  console.log(req.body);
  
  try {
    // Validate input
    const isValidEmail = validateEmail(email);
    const isValidPassword = validatePassword(password);
    const isValidConfirmPassword = validatePassword(confirmPassword);

    if (!isValidEmail) {
      return res.status(400).json({ msg: 'Invalid email' });
    }

    if (!isValidPassword ) {
      return res.status(400).json({ msg: 'Invalid password' });
    }

    if (!isValidConfirmPassword) {
      return res.status(400).json({ msg: 'Invalid confirm' });
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
      role: 'user',
    });

     // Save the new user
     const savedUser = await newUser.save();
     console.log("Email Verification Sent");

    // Send verification email
    sendVerificationEmail(email, firstName, otp);

    res.setHeader('email', ` ${email}`);
    res.status(201).json({ msg: 'Verification email sent', email });
  } catch (err) {
    next(err);
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    console.log(otp);

     // Find the vendor by the OTP
     const user = await User.findOne({ otp });

     if (!user) {
       return res.status(404).json({ error: 'Invalid OTP' });
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

// Login a user and generate a JWT
const login = async (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }


    if (!user) {
      console.log(user);
      return res.status(401).json(info);
    }

    const payload = {
      userId: user._id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.setHeader('Authorization', `Bearer ${token}`);
    res.json({ msg: `Welcome back, ${user.firstName}`, token });
  })(req, res, next);
};



// Reset Password Email
const resetPasswordEmail = async (req, res, next) => {
  const email  = req.body.email;
  try {

    // Check if the user exists
    const user = await User.findOne({ email });
    console.log(user);
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
   const resetOtpExpires = new Date(Date.now() + 4 * 60 * 1000);

   // Save the reset token to the user's document
   user.resetOtp = resetOtp;
   user.resetOtpExpires = resetOtpExpires;
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

  
  // Update Password
  const updatePassword = async (req, res, next) => {
    const { resetOtp, newPassword, confirmPassword } = req.body;
    console.log(resetOtp);
  
    try {
      if (newPassword !== confirmPassword) {
        console.log(newPassword, confirmPassword);
        return res.status(400).json({ msg: 'Passwords do not match' });
      }
  
      // Check if the user exists
      const user = await User.findOne({ resetOtp });
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      // Verify the reset token and expiration time
      if (!user.resetOtp || user.resetOtp != resetOtp ) {
        // console.log('resetOtp:', resetOtp, 'type:', typeof resetOtp);
        // console.log('user.resetOtp:', user.resetOtp, 'type:', typeof user.resetOtp);
        // console.log(user);
        return res.status(400).json({ msg: 'Invalid or expired otp' });
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update the user's password and reset token
      user.password = hashedPassword;
      user.resetOtp = null;
      user.resetOtpExpires = null;
      await user.save();

      console.log(hashedPassword);
      console.log(newPassword);
  
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
      let email = (req.headers.email);
  
      // Find the user by email
      const user = await User.findOne({email} );
  
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