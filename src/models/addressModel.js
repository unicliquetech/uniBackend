const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  location: {
    type: String,
    required: true,
  },
  university: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['HOSTEL', 'DEPARTMENT', 'GIFT'],
    required: true,
  },
});

const Address = mongoose.model('Address', addressSchema);


module.exports = Address;