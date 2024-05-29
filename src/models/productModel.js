const { required, number } = require("joi");
const mongoose = require("mongoose");
const { type } = require("os");
const shortid = require('shortid');

const ProductSchema = new mongoose.Schema(
  {
    productId: {
        type: String,
        default: shortid.generate,
        required: true,
    },
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide product name"],
      maxlength: [100, "Name can not be more than 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
      maxlength: [1000, "Description can not be more than 1000 characters"],
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: [true, "Please provide product category"],
      enum: ["skincare", "stationery", "snacks", "cakes", "fastfood", "facecare", "haircare", "footwear"],
    },
    company: {
      type: String,
      required: [true, "Please provide company"],
    },
    colors: {
      type: [String],
      default: ["#222"],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    deliveryTime: {
      type: [Number],
      required: true,
    },
    deliveryNote: {
      type: String,
      enum: ["Delivery Charges Apply", "Free Delivery"],
      required: true,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    // user: {
    //   type: mongoose.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ProductSchema.virtual("reviews", {
//   ref: "Review",
//   localField: "_id",
//   foreignField: "product",
//   justOne: false,
// });

// ProductSchema.pre("remove", async function (next) {
//   await this.model("Review").deleteMany({ product: this._id });
// });

module.exports = mongoose.model("Product", ProductSchema);