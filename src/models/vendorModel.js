const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  businessName: { 
    type: String, 
    required: true 
},
  businessDescription: {
     type: String, 
     required: true 
    },
  ownerName: {
     type: String, 
     required: true 
    },
  phoneNumber: {
     type: String, 
     required: true 
    },
  email: { 
    type: String, 
    required: true, 
    unique: true 
},
  password: {
     type: String, 
     required: true 
    },
  category: { 
    type: String, 
    required: true 
},
  isVerified: { 
    type: Boolean, 
    default: false 
},
  otp: { 
    type: String 
},
  resetOtp: { 
    type: String 
},
  otpExpires: { 
    type: Date 
},
});

module.exports = mongoose.model("Vendor", vendorSchema);
