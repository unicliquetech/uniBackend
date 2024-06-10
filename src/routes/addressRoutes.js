const express = require('express');
const router = express.Router();
const {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
} = require('../controllers/addressController');
const {authenticateUser} = require('../middleware/authMiddleware');

// Get all addresses for the authenticated user
router.get('/', authenticateUser, getAddresses);

// Create a new address for the authenticated user
router.post('/', authenticateUser, createAddress);

// Update an existing address
router.put('/:id', authenticateUser, updateAddress);

// Delete an existing address
router.delete('/:id', authenticateUser, deleteAddress);



module.exports = router;