const CartData = require('../models/cartItemModel');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./cart');
const getNewCartId = () => {
  return crypto.randomBytes(16).toString('hex');
};



const getCart = async (req, res) => {
  try {
    // Check if cartId is provided in the request body or query parameters
    let cartId = req.headers.cartId || req.query.cartId;

    // If cartId is not provided, try to find an existing cart in the database
    if (!cartId) {
      const existingCart = await CartData.findOne({});

      // If a cart exists in the database, use its cartId
      if (existingCart) {
        cartId = existingCart.cartId;
      } else {
        // If no cart exists in the database, return an empty array
        return res.json([]);
      }
    }

    // Find the cart data in the database using the cartId
    const cartItems = await CartData.find({ cartId });

    // Return the cart items
    res.json(cartItems);
    // console.log(cartId, cartItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cart data' });
  }
};

// Middleware to add a new item to the cart
const addCartItem = async (req, res, next) => {
  const { productId, quantity, image, name, price, colors, freeShipping, deliveryTime } = req.body;
  try {
    let cart;
    let cartId = localStorage.getItem('cartId'); // Get the cartId from the localStorage

    // If no cartId is in the localStorage, generate a new one and save it to the localStorage
    if (!cartId) {
      cartId = getNewCartId();
      localStorage.setItem('cartId', cartId);
    }

    // Find the existing cart or create a new one based on the cartId
    cart = await CartData.findOne({ cartId });
    if (!cart) {
      cart = new CartData({
        cartId,
        name,
        price,
        image,
        quantity,
        productId,
        colors,
        freeShipping,
        deliveryTime,
      });
    } else {
      // If the product already exists in the cart, update its quantity
      if (cart.productId === productId) {
        cart.quantity += quantity;
      } else {
        // If the product doesn't exist, create a new CartData instance
        const newProduct = new CartData({
          cartId,
          name,
          price,
          image,
          quantity,
          productId,
          colors,
          freeShipping,
          deliveryTime,
        });
        await newProduct.save();
      }
    }

    // Save the updated cart or the new product
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error('Error adding item to cart:', err);
    res.status(500).json({ error: 'An error occurred while adding the item to the cart.' });
  }
};



const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    let cartId = localStorage.getItem('cartId');

    if (!cartId) {
      return res.status(400).json({ error: 'No cart found.' });
    }

    const cartItem = await CartData.findOneAndUpdate(
      { cartId, productId }, // Find the cart item by cartId and productId
      { $set: { quantity } }, // Update the quantity
      { new: true } // Return the updated document
    );

    if (cartItem) {
      res.json(cartItem);
    } else {
      res.status(404).json({ error: 'Cart item not found' });
    }
  } catch (err) {
    console.error('Error updating cart item:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};


  const deleteCartItem = async (req, res, next) => {
    const { productId } = req.params;
  
    try {
      let cartId = localStorage.getItem('cartId');
      
  
      // If there is no cartId in the localStorage, return an error
      if (!cartId) {
        return res.status(400).json({ error: 'No cart found.' });
      }
  
      // Find the existing cart based on the cartId
      let cart = await CartData.find({ cartId });
      const cartItem = cart.find(item => item.productId === productId);
  
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found.' });
      }
  
      // Remove the product from the cart
      if (cartItem.productId === productId) {
        // If the cart contains the product to be removed, delete the cart
        await CartData.deleteOne({ productId });
      } else {
        // If the cart doesn't contain the product, return an error
        return res.status(404).json({ error: 'Product not found in cart.' });
      }
  
      res.json({ message: 'Product removed from cart.' });
    } catch (err) {
      console.error('Error removing item from cart:', err);
      res.status(500).json({ error: 'An error occurred while removing the item from the cart.' });
    }
  };

// Route to get the cartId from the database
// const getCartId = async (req, res) => {
//   try {
//     // Retrieve the cartId from the database
//     const cart = await CartModel.findOne({}, { cartId: 1 });

//     if (cart) {
//       res.json({ cartId: cart.cartId });
//     } else {
//       res.status(404).json({ error: 'No cart found' });
//     }
//   } catch (error) {
//     console.error('Error retrieving cartId:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // Route to create or update a cart in the database
// const createCartId = async (req, res) => {
//   try {
//     const { cartId } = req.body;

//     // Check if a cart with the provided cartId already exists
//     let cart = await CartModel.findOne({ cartId });

//     if (!cart) {
//       // If no cart exists, create a new one
//       cart = new CartModel({ cartId });
//       await cart.save();
//     }

//     res.status(200).json({ message: 'Cart created or updated successfully' });
//   } catch (error) {
//     console.error('Error creating or updating cart:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };



module.exports = {
  addCartItem,
  getCart,
  updateCartItem,
  deleteCartItem,
  // getCartId,
  // createCartId,
};