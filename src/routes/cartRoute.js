const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const {
    getCart,
    addCartItem,
    updateCartItem,
    deleteCartItem,
    getCartItem,
    // createCartId,
} = require('../controllers/cartController');
// const {authenticateToken} = require('../middleware/authMiddleware');

router.get('/', getCart);
router.post('/',  addCartItem);
router.post('/items',  getCartItem);
router.put('/:productId',  updateCartItem);
router.delete('/:productId',  deleteCartItem);
// router.post('/create-cart', createCartId);
// router.get('/get-cart-id', getCartId);

module.exports = router;