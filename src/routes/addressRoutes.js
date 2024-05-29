const express = require('express');
const router = express.Router();
const {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
} = require('../controllers/addressController');
const authenticationToken = require('../middleware/authMiddleware');

// Get all addresses for the authenticated user
router.get('/', authenticationToken, getAddresses);

// Create a new address for the authenticated user
router.post('/', authenticationToken, createAddress);

// Update an existing address
router.put('/:id', authenticationToken, updateAddress);

// Delete an existing address
router.delete('/:id', authenticationToken, deleteAddress);



module.exports = router;