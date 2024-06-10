const { required } = require("joi");
const mongoose = require("mongoose");

const SingleOrderItemSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  }, 
  image: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: true,
  },
});

const OrderSchema = mongoose.Schema(
  {
    serviceCharge: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
        type: String,
        required: true,
    },
    user : {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    orderItems: [SingleOrderItemSchema],
    orderStatus: {
      type: String,
      enum: ["pending", "paid", "delivered", "failed", "canceled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", OrderSchema);