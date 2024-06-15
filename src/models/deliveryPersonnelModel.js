const mongoose = require('mongoose');

const deliveryPersonnelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fee: {
    type: Number,
    required: true,
  },
  serviceArea: {
    type: String,
    required: true,
  },
  availability: {
    type: String,
    required: true,
  },
  vehicle: {
    type: String,
    required: true,
  },
});

const DeliveryPersonnel = mongoose.model('DeliveryPersonnel', deliveryPersonnelSchema);

module.exports = DeliveryPersonnel;