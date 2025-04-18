const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    maxlength: [100, "Name can not be more than 100 characters"],
  },
  price: {
    type: Number,
    required: [true, "Please provide product price"],
    default: 0,
  },
  image: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  colors: {
    type: [String],
    default: ["#222"],
    required: true,
  },
  freeShipping: {
    type: Boolean,
    default: false,
  },
  deliveryTime: {
    type: [Number],
    default: false,
  },
});

const CartSchema = new mongoose.Schema({
  cartId: {
    type: String,
    required: true,
    unique: true,
  },
  items: [CartItemSchema]
});

module.exports = mongoose.model('CartData', CartSchema);