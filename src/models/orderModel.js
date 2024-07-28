const mongoose = require('mongoose');

const SingleOrderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: [String], required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
});

const OrderSchema = new mongoose.Schema(
  {
    orderItems: [SingleOrderItemSchema],
    total: 
    { 
      type: Number, 
      required: true 
    },
    subtotal: 
    { 
      type: Number, 
      required: true 
    },
    serviceCharge: 
    { 
      type: Number, 
      required: true 
    },
    deliveryFee: 
    { 
      type: [Number], 
      required: true 
    },
    deliveryAddress: 
    { 
      type: String, 
      required: true 
    },
    userId: 
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', required: true 
    },
    vendorId: 
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Vendor', required: true 
    },
    orderId: 
  { 
      type: String, 
      required: true, 
      unique: true 
  },
    orderStatus: 
  { 
      type: String, 
      enum: ['pending', 'paid', 'delivered', 'failed', 'canceled'], 
      default: 'pending' 
  },
    deliveryTime: 
    { 
      type: [Number], 
      required: true 
    },
    // paymentIntentId: 
    // { 
    //   type: String, 
    //   required: true 
    // },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);