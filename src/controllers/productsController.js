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
      image: JSON.parse(image),
      deliveryTime,
      deliveryNote,
    });

    if (typeof newProduct.image === 'string') {
      newProduct.image = JSON.parse(newProduct.image);
    }

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

const getAllProducts = async (req, res) => {
  const { category, name, description, sponsored } = req.query;
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

  // Add this condition to filter sponsored products
  if (sponsored !== undefined) {
    queryObject.sponsored = sponsored === 'true';
  }
  
  // const products = await Product.find(queryObject);
  // res.status(StatusCodes.OK).json({ products, count: products.length });

  const products = await Product.find(queryObject).lean();
  
  // Modify the products to include only the first image
  const modifiedProducts = products.map(product => ({
    ...product,
    image: Array.isArray(product.image) ? product.image[0] : product.image
  }));
  
  res.status(StatusCodes.OK).json({ products: modifiedProducts, count: products.length });
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

// const uploadImage = async (req, res) => {
//   if (!req.files || Object.keys(req.files).length === 0) {
//     return res
//       .status(StatusCodes.BAD_REQUEST)
//       .json({ error: "No image file provided" });
//   }

//   // Assuming that the file input field name is 'image'
//   const file = req.files.image;

//   if (!file) {
//     return res
//       .status(StatusCodes.BAD_REQUEST)
//       .json({ error: "No image file provided" });
//   }

//   const result = await cloudinary.uploader.upload(file.tempFilePath, {
//     use_filename: true,
//     folder: "file-upload",
//   });

//   // Remove the temporary file from the server
//   fs.unlinkSync(file.tempFilePath);

//   return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });
// };

// const uploadImage = async (req, res) => {
//   if (!req.files || Object.keys(req.files).length === 0) {
//     return res
//       .status(StatusCodes.BAD_REQUEST)
//       .json({ error: "No image files provided" });
//   }

//   const files = Array.isArray(req.files.image) ? req.files.image : [req.files.image];

//   const uploadPromises = files.map(file => 
//     cloudinary.uploader.upload(file.tempFilePath, {
//       use_filename: true,
//       folder: "file-upload",
//     })
//   );

//   try {
//     const results = await Promise.all(uploadPromises);
//     const imageUrls = results.map(result => result.secure_url);
//     res.status(StatusCodes.OK).json({ imageUrls });
//   } catch (error) {
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Image upload failed" });
//   }
// };

const uploadImage = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "No image files provided" });
  }

  try {
    const uploadPromises = Object.values(req.files).map(file =>
      cloudinary.uploader.upload(file.tempFilePath, {
        use_filename: true,
        folder: "file-upload",
      })
    );

    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map(result => result.secure_url);

    res.status(StatusCodes.OK).json({ images: imageUrls });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Image upload failed" });
  }
};

const getProductsByVendor = async (req, res) => {
    const vendorEmail  = (req.params.vendorId);
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
