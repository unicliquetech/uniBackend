const Product = require("../models/productModel");
const Vendor = require("../models/vendorModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); 

// const createProduct = async (req, res) => {
//   // req.body.user = req.user.userId;
//   const product = await Product.create(req.body);
//   res.status(StatusCodes.CREATED).json({ product });
// };

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      brand,
      gender,
      stockNumber,
      colours,
      sponsored,
      shipping,
      rating,
      numOfReviews,
      refund,
      vendorEmail,
      image,
      deliveryTime,
      deliveryNote,
    } = req.body;

    console.log(req.body);
    // Find the vendor based on the userEmail
    const vendor = await Vendor.findOne({ email: vendorEmail });
    const vendorId = (vendor._id);

    // Assuming you have a Product model
    const newProduct = new Product({
      name,
      description,
      category,
      brand,
      gender,
      stockNumber,
      colours: JSON.parse(colours),
      sponsored,
      shipping,
      rating,
      numOfReviews,
      price,
      discountPrice,
      refund,
      vendorId,
      image,
      deliveryTime,
      deliveryNote,
    });

    const savedProduct = await newProduct.save();
    console.log(savedProduct);
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

const getAllProducts = async (req, res) => {
  // console.log(req.query)
  const { category, name, description } = req.query;
  const queryObject = {};

  if (category) {
    queryObject.category = category;
  }

  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }
  if (description) {
    queryObject.description = { $regex: description, $options: "i" };
  }
  console.log(queryObject);
  const products = await Product.find(queryObject);
  res.status(StatusCodes.OK).json({ products, count: products.length });
};
const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });

  if (!product) {
    return res.status(StatusCodes.BAD_REQUEST).json(`No product with id : ${productId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return res.status(StatusCodes.BAD_REQUEST).json(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOneAndDelete({ _id: productId });

  if (!product) {
    return res.status(StatusCodes.BAD_REQUEST).json(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ msg: "Success! Product removed." });
};

const uploadImage = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "No image file provided" });
  }

  // Assuming that the file input field name is 'image'
  const file = req.files.image;

  if (!file) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "No image file provided" });
  }

  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    use_filename: true,
    folder: "file-upload",
  });

  console.log(result.secure_url);

  // Remove the temporary file from the server
  fs.unlinkSync(file.tempFilePath);

  return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });
};

const getProductsByVendor = async (req, res) => {
    console.log(req.params.vendorId);
    const vendorEmail  = (req.params.vendorId);
    console.log(vendorEmail);
    const vendor = await Vendor.findOne({ email: vendorEmail });

    if (vendor) {
      const vendorId = (vendor._id);
      try {
        const vendorProducts = await Product.find({ vendorId });
        res.status(StatusCodes.OK).json({ products: vendorProducts, count: vendorProducts.length });
      } catch (error) {
        console.error("Error retrieving products for vendor:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to retrieve products for vendor" });
      }
    } else {
      // Handle the case when vendor is not found
      console.log(`Vendor with email ${vendorEmail} not found`);
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "No email provided" });
    }
  
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  getProductsByVendor,
};
