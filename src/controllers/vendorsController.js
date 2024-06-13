const Vendor = require('../models/vendorModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');

exports.getVendorProfile = async (req, res) => {
  const vendorEmail = req.body.vendorEmail;
  // console.log("EMAIL RECEIVED:", vendorEmail);

  try {
    const vendor = await Vendor.findOne({ email: vendorEmail });
    // console.log(vendor);

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const vendorId = vendor._id;

    const products = await Product.find({ vendorId });
    const orders = await Order.find({ vendorId });
    // const name = vendor.ownerName;
    // const email = vendor.email;

    res.status(200).json({
      vendor,
      products,
      orders,
      // name,
      // email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};