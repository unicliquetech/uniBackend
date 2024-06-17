const express = require('express');
const router = express.Router();
const vendorProfileController = require('../controllers/vendorsController');

router.post('/', vendorProfileController.getVendorProfile);
// app.get('/api/v1/vendorPage/:vendorName')
// app.post('/api/v1/vendorPage/:vendorName/reviews', authenticateToken,)
// app.put('/api/v1/vendorPage/:vendorName/reviews/:reviewId', authenticateToken,)
// app.delete('/api/v1/vendorPage/:vendorName/reviews/:reviewId', authenticateToken,)


module.exports = router;