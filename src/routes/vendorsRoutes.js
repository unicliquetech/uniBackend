const express = require('express');
const router = express.Router();
const {
    getVendorProfile,
  fetchVendorData,
  submitReview,
  updateReview,
  deleteReview,
  authenticateUser,
} = require('../controllers/vendorsController');

router.post('/', getVendorProfile);
router.get('/vendorPage/:businessName', fetchVendorData)
router.post('/vendorPage/:businessName/auth', authenticateUser)
router.post('/vendorPage/:businessName/reviews', submitReview)
router.put('/vendorPage/:vendorName/reviews/:reviewId', updateReview)
router.delete('/vendorPage/:vendorName/reviews/:reviewId', deleteReview)


module.exports = router;