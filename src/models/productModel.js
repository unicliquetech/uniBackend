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
        required: [true, "Please provide base product price"],
        default: 0,
      },
    discountPrice: {
        type: Number,
        default: 0,
      },
    refund: {
        type: Boolean,
        default: false,
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
      enum: ["skincare", "stationery", "snacks", "cakes", "fastfood", "facecare", "haircare", "footwear", "gadgets",],
    },
    subcategory: {
      type: String,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    vendorlogo: {
      type: String,
    },
    colours: {
      type: [String],
      default: ["#222"],
      required: true,
    },
    sponsored: {
      type: Boolean,
      default: false,
    },
    shipping: {
      type: String,
      enum: ['regular', 'express', 'schedule'],
      required: true,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    brand: {
      type: String,
    },
    deliveryTime: {
      type: String,
    },
    deliveryNote: {
      type: String,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unisex'],
    },
    stockNumber: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model("Product", ProductSchema);


// user: {
    //   type: mongoose.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },

// ProductSchema.virtual("reviews", {
//   ref: "Review",
//   localField: "_id",
//   foreignField: "product",
//   justOne: false,
// });

// ProductSchema.pre("remove", async function (next) {
//   await this.model("Review").deleteMany({ product: this._id });
// });