const Order = require('../models/orderModel');
const Product = require('../models/productModel');

const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const { checkPreferences } = require('joi');


const StripeAPI = async ({ amount, currency }) =>{
    // const client_secret = 'randomValue';
    return {client_secret, amount};
};

const createOrder = async (req, res) =>{
    const { items: cartItems, serviceCharge, deliveryAddress, userId, orderStatus, shippingFee} = req.body

    if (!cartItems || cartItems.length < 1){
        throw new CustomError.BadRequestError('No cart items provided');
    }

    if (!serviceCharge || !shippingFee){
        throw new CustomError.BadRequestError(
            'Please provide charges and shipping fee'
        );
    }

    let orderItems = [];
    let subtotal = 0;

    for (const item of cartItems){
        const dbProduct = await Product.findOne({ _id: item.product});
        if (!dbProduct){
            throw new CustomError.NotFoundError(
                `No product with id : ${item.product}`
            );
        }
        const {name, price, image, _id} = dbProduct
        const SingleOrderItem = {
            quantity: item.quantity,
            name,
            price,
            image,
            product: _id,
        };

        // add items to order
        orderItems = [...orderItems, SingleOrderItem];
        // calculate subtotal
        subtotal += item.amount * price;
    }
    // calculate total
    const total = charges + shippingFee + subtotal;

    // get client secret
    const paymentIntent = await StripeAPI({
        amount: total,
        currency: 'naira',
    });

    const order = await Order.create({
        orderItems,
        total,
        subtotal,
        serviceCharge,
        shippingFee,
        deliveryAddress,
        clientSecret: paymentIntent.client_secret,
        userId: req.user.userId
    });

    res.status(StatusCodes.CREATED).json({ order, clientSecret: order.clientSecret});
}

const getAllOrders = async (req, res) => {
    const orders = await Order.find({});
    res.status(StatusCodes.OK).json({ orders, count: orders.length});
}

const getSingleOrder = async (req, res) => {
    const { id: orderId } = req.params;
    const order = await Order.findOne({ _id: orderId});
    
    if (!order){
        throw new CustomError.NotFoundError(`No order with id: ${orderId}`);
    }

    checkPermissions(req.user, order.user);
    res.status(StatusCodes.OK).json({ order});
}

const getCurrentUserOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user.userId});
    res.status(StatusCodes.OK).json({ orders, count: orders.length});
}

const updateOrder = async (req, res) => {
    const {id: orderId} = req.params;
    const { paymentIntentId } = req.body;


    const order = await Order.findOne({ _id: orderId});
    if (!order){
        throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
    }
    checkPermissions(req.user, order.user);

    order.paymentIntentId = paymentIntentId;
    order.status = 'paid';
    await order.save();

    res.status(StatusCodes.OK).json({ order });
};

module.exports = {
    createOrder,
    updateOrder,
    getSingleOrder,
    getAllOrders,
    getCurrentUserOrders,
};