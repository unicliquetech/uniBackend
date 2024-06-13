const express = require("express");
const router = express.Router();
const { authenticateUser, authorizePermissions } = require('../middleware/authMiddleware');

const {
  createOrder,
  updateOrder,
  getSingleOrder,
  getAllOrders,
  getCurrentUserOrders,
} = require("../controllers/ordersController");

router.route("/")
      .post( createOrder)
      .get(getAllOrders);
      
router.route('/:id')
      .get( getSingleOrder);

router.route('/:orderId/status')
      .patch( updateOrder);

router.route('/showAllMyOrders')
      .get( getCurrentUserOrders);

router.route('/:id')
      .get( getSingleOrder)
      .patch( updateOrder);

module.exports = router;