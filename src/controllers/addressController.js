const mongoose = require('mongoose');
const Address = require('../models/addressModel');
const User = require('../models/userModel');
const { scryptSync } = require('crypto');
const jwt = require('jsonwebtoken');


// Get all addresses for the authenticated user
const getAddresses = async (req, res) => {
  try {
    const userId = req.headers['user-id']; // Get the userId from the request headers
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const addresses = await Address.find({ user: userId });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Create a new address for the authenticated user
const createAddress = async (req, res) => {
  try {
    const userId = req.headers['user-id'];

    // Validate the userId
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a new _id
    const newId = new mongoose.Types.ObjectId();

    const newAddress = new Address({ ...req.body, user: userId, _id: newId });

    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
    console.log(err);
  }
};

// Update an existing address
const updateAddress = async (req, res) => {
  try {
    const userId = req.headers['user-id']; // Get the userId from the request headers
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      req.body,
      { new: true }
    );
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }
    res.json(address);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
    console.log(err);
  }
};

// Delete an existing address
const deleteAddress = async (req, res) => {
  try {
    const userId = req.headers['user-id']; // Get the userId from the request headers
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
    console.log(err);
  }
};



module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
}