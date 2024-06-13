const express = require('express');
const router = express.Router();
const vendorProfileController = require('../controllers/vendorsController');

router.post('/', vendorProfileController.getVendorProfile);

module.exports = router;