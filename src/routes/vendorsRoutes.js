const express = require('express');
const router = express.Router();
const {
    getVendorProfile,
  fetchVendorData,
  submitReview,
  updateReview,
  deleteReview,
  authenticateToken,
} = require('../controllers/vendorsController');

router.post('/', getVendorProfile);
router.get('/vendorPage/:businessName', fetchVendorData)
router.post('/vendorPage/:businessName/auth', authenticateToken)
router.post('/vendorPage/:businessName/reviews', authenticateToken, submitReview)
router.put('/vendorPage/:vendorName/reviews/:reviewId', authenticateToken, updateReview)
router.delete('/vendorPage/:vendorName/reviews/:reviewId', authenticateToken, deleteReview)


module.exports = router;