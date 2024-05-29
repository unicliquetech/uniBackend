const Product = require("../models/productModel");
const { StatusCodes } = require("http-status-codes");
// const CustomError = require("../errors");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Specify the upload directory

const createProduct = async (req, res) => {
  // req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  // console.log(req.query)
  const {category, name, description } = req.query
  const queryObject = {}

  if(category){
    queryObject.category = category
  }

  if (name) {
    queryObject.name = { $regex: name, $options: 'i'}
  }
  if (description) {
    queryObject.description = { $regex: description, $options: 'i'}
  }
  console.log(queryObject)
  const products = await Product.find(queryObject);
  res.status(StatusCodes.OK).json({ products, count: products.length });
};
 const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${productId}`);
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
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  await product.remove();
  res.status(StatusCodes.OK).json({ msg: "Success! Product removed." });
};

const uploadImage = async (req, res) => {
    try {
      const result = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        {
          use_filename: true,
          folder: 'file-upload',
        }
      );
  
      fs.unlinkSync(req.files.image.tempFilePath);
  
      return res.status(StatusCodes.OK).json({ image: { src: result.secure_url }});
    } catch (err) {
      console.error('Error uploading image:', err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to upload image' });
    }
  };



module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};