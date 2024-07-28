const CartData = require('../models/cartItemModel');
const crypto = require('crypto');
const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./cart');

let getNewCartId = () => {
  return crypto.randomBytes(16).toString('hex');
};

const getCartItem = async (req, res) => {
  const { cartId } = req.body;

  if (!cartId) {
    return res.status(400).json({ error: 'cartId is required' });
  }

  try {
    let cart = await CartData.findOne({ cartId });

    if (!cart) {
      const newCartId = getNewCartId();
      cart = new CartData({ cartId: newCartId, items: [] });
      await cart.save();
      return res.status(201).json({ cartId: newCartId, items: [] });
    }
    
    console.log(cart);
    res.json({ items: cart.items || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCart = async (req, res) => {
  try {
    let cartId = req.headers.cartId || req.query.cartId || localStorage.getItem('cartId');

    if (!cartId) {
      const existingCart = await CartData.findOne({});
      if (existingCart) {
        cartId = existingCart.cartId;
      } else {
        return res.json([]);
      }
    }

    const cart = await CartData.findOne({ cartId });
    res.json(cart ? cart.items : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cart data' });
  }
};

const addCartItem = async (req, res) => {
  const { productId, quantity, image, name, price, colors, freeShipping, deliveryTime, cartId } = req.body;
  try {
    let cart;
    let newCartId = cartId;

    if (!newCartId) {
      newCartId = crypto.randomBytes(16).toString('hex');
      cart = new CartData({ cartId: newCartId, items: [] });
    } else {
      cart = await CartData.findOne({ cartId: newCartId });
      if (!cart) {
        cart = new CartData({ cartId: newCartId, items: [] });
      }
    }

    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        name,
        price,
        image,
        quantity,
        productId,
        colors,
        freeShipping,
        deliveryTime,
      });
    }

    await cart.save();
    res.json(newCartId);
  } catch (err) {
    console.error('Error adding item to cart:', err);
    res.status(500).json({ error: 'An error occurred while adding the item to the cart.' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, cartId } = req.body;


    if (!cartId) {
      return res.status(400).json({ error: 'No cart found.' });
    }

    const cart = await CartData.findOne({ cartId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.productId === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      res.json(cart.items[itemIndex]);
    } else {
      res.status(404).json({ error: 'Cart item not found' });
    }
  } catch (err) {
    console.error('Error updating cart item:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const deleteCartItem = async (req, res) => {
  const { productId } = req.params;
  const { cartId } = req.body;

  try {

    if (!cartId) {
      return res.status(400).json({ error: 'No cart found.' });
    }

    let cart = await CartData.findOne({ cartId });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found.' });
    }

    cart.items = cart.items.filter(item => item.productId !== productId);
    await cart.save();

    res.json({ message: 'Product removed from cart.', items: cart.items });
  } catch (err) {
    console.error('Error removing item from cart:', err);
    res.status(500).json({ error: 'An error occurred while removing the item from the cart.' });
  }
};

module.exports = {
  addCartItem,
  getCart,
  updateCartItem,
  deleteCartItem,
  getCartItem,
};