const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Vendor = require('../models/vendorModel');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const sendWhatsAppNotification = require('../utils/sendWhatsappNotification');


const createOrder = async (req, res) => {
  const { items: cartItems, serviceCharge, selectedAddress, orderStatus, deliveryFee, userId } = req.body;
  // console.log(req.body);
  const generateOrderId = () => {
    const min = 1000;
    const max = 9999;
    const orderId = Math.floor(Math.random() * (max - min + 1)) + min;
    return orderId.toString();
  };
  
  // Usage
  const orderId = generateOrderId()

  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError('No cart items provided');
  }

//   console.log(serviceCharge, deliveryFee);
  if (!serviceCharge || !deliveryFee) {
    throw new CustomError.BadRequestError('Please provide charges and shipping fee');
  }

  let orderItems = [];
  let subtotal = 0;
  let vendorWhatsAppNumber = null;
  let deliveryTime;
  let vendorId;

  for (const item of cartItems) {
    const productId = (item.productId);
    // const deliveryTime = (item.deliveryTime);
    const dbProduct = await Product.findOne({ productId });


    if (!dbProduct) {
      throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }

    const { name, price, image, _id, vendorId: itemVendorId, deliveryTime: itemDeliveryTime } = dbProduct;
    const vendorIdString = itemVendorId.toString();
    console.log(vendorIdString);
    const vendorUser = await Vendor.findById(vendorIdString);

    if (!vendorUser) {
      throw new CustomError.NotFoundError(`No vendor found for product: ${_id}`);
    }

    vendorWhatsAppNumber = vendorUser.phoneNumber;
    const SingleOrderItem = {
      quantity: item.quantity,
      name,
      price,
      image,
      productId: _id,
    };

    // add items to order
    orderItems = [...orderItems, SingleOrderItem];

    // calculate subtotal
    subtotal += item.quantity * price;

    deliveryTime = itemDeliveryTime;
    vendorId = itemVendorId;
  }

  // calculate total
  const total = serviceCharge + deliveryFee + subtotal;
  const deliveryAddress = selectedAddress.location.concat(' ', selectedAddress.university, ' ', selectedAddress.city);
  console.log(deliveryAddress);


  const order = await Order.create({
    orderId,
    orderItems,
    total,
    subtotal,
    serviceCharge,
    deliveryFee,
    deliveryAddress,
    userId,
    orderStatus,
    deliveryTime,
    vendorId,
  });

  // Send WhatsApp notification
  const orderItemsText = order.orderItems
    .map((item) => `- ${item.name} (Quantity: ${item.quantity}, Price: ${item.price})`)
    .join('\n');

  // const notificationMessage = `New Order Received:\n\nOrder Items:\n${orderItemsText}\n\nTotal: ${order.total}\nDelivery Address: ${order.deliveryAddress}`;

  // console.log(vendorWhatsAppNumber);
  // console.log(notificationMessage);
  // if (vendorWhatsAppNumber) {
  //   sendWhatsAppNotification(vendorWhatsAppNumber, notificationMessage);
  // }

  res.status(StatusCodes.CREATED).json({ order, vendorWhatsAppNumber });
};



// const createOrder = async (req, res) => {
//   const {
//     items: cartItems,
//     serviceCharge,
//     deliveryAddress,
//     userId,
//     orderStatus,
//     shippingFee,
//     deliveryTime,
//     vendorWhatsAppNumber,
//   } = req.body;

//   if (!cartItems || cartItems.length < 1) {
//     throw new CustomError.BadRequestError('No cart items provided');
//   }

//   if (!serviceCharge || !shippingFee) {
//     throw new CustomError.BadRequestError(
//       'Please provide charges and shipping fee'
//     );
//   }

//   let orderItems = [];
//   let subtotal = 0;

//   for (const item of cartItems) {
//     const dbProduct = await Product.findOne({ _id: item.product });

//     if (!dbProduct) {
//       throw new CustomError.NotFoundError(
//         `No product with id : ${item.product}`
//       );
//     }

//     const { name, price, image, _id } = dbProduct;
//     const SingleOrderItem = {
//       quantity: item.quantity,
//       name,
//       price,
//       image,
//       productId: _id,
//     };

//     // add items to order
//     orderItems = [...orderItems, SingleOrderItem];

//     // calculate subtotal
//     subtotal += item.quantity * price;
//   }

//   // calculate total
//   const total = serviceCharge + shippingFee + subtotal;

//   const order = await Order.create({
//     orderItems,
//     total,
//     subtotal,
//     serviceCharge,
//     shippingFee,
//     deliveryAddress,
//     userId,
//     orderStatus,
//     deliveryTime,
//   });

//   // Send WhatsApp notification
//   const orderItemsText = order.orderItems
//     .map(
//       (item) =>
//         `- ${item.name} (Quantity: ${item.quantity}, Price: ${item.price})`
//     )
//     .join('\n');

//   const notificationMessage = `New Order Received:\n\nOrder Items:\n${orderItemsText}\n\nTotal: ${order.total}\nDelivery Address: ${order.deliveryAddress}`;

//   sendWhatsAppNotification(vendorWhatsAppNumber, notificationMessage);

//   res.status(StatusCodes.CREATED).json({ order });
// };













const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });

  if (!order) {
    throw new CustomError.NotFoundError(`No order with id: ${orderId}`);
  }

  checkPermissions(req.user, order.userId);
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const { orderStatus } = req.body;

  try {
    const order = await Order.findOneAndUpdate(
      { orderId: orderId },
      { $set: { orderStatus } },
      { new: true, runValidators: true }
    );

    if (!order) {
      throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
    }

    res.status(StatusCodes.OK).json({ order });
  } catch (error) {
    console.log(error);
    throw new CustomError.BadRequestError('Error updating order status');
  }
};

const getVendorOrders = async (req, res) => {
  const orders = await Order.find({});
  const vendorOrders = orders.reduce((acc, order) => {
    const vendorProducts = order.orderItems.filter((item) =>
      req.user.products.includes(item.productId)
    );
    if (vendorProducts.length > 0) {
      acc.push({ order, vendorProducts });
    }
    return acc;
  }, []);

  res.status(StatusCodes.OK).json({ vendorOrders, count: vendorOrders.length });
};

module.exports = {
  createOrder,
  updateOrder,
  getSingleOrder,
  getAllOrders,
  getCurrentUserOrders,
  getVendorOrders,
};