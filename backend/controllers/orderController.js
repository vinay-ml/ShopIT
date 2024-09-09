import Order from "../models/order.js";
import Product from "../models/product.js";

// Create new Order
export const newOrder = async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxAmount,
    shippingAmount,
    totalAmount,
    paymentMethod,
    paymentInfo,
  } = req.body;

  const user = req.user._id;

  const order = await Order.create({
    user,
    orderItems,
    shippingInfo,
    itemsPrice,
    taxAmount,
    shippingAmount,
    totalAmount,
    paymentMethod,
    paymentInfo,
  });

  res.status(200).json({
    order,
  });
};

// Get order details => /api/v1/orders/:id
export const getOrderDetails = async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  const user = req.user;

  if (!order) {
    return res.status(404).json({ Error: "No Ordre found with this ID" });
  }

  res.status(200).json({ order, user });
};

// get current user orders => /api/v1/me/orders
export const myOrders = async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).populate(
    "user",
    "name email"
  );

  res.status(200).json({ orders });
};

// Get all orders -ADMIN => /api/v1/admin/orders
export const allOrders = async (req, res, next) => {
  const orders = await Order.find();

  res.status(200).json({ orders });
};

// update the order - ADMIN => /api/v1/admin/orders/:id
export const updateOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ error: "No order found with this ID" });
  }

  if (order.orderStatus === "Delivered") {
    return res
      .status(400)
      .json({ message: "You have already delivered this order" });
  }

  // Update Products stock
  const updateStockPromises = order.orderItems.map(async (item) => {
    const product = await Product.findById(item.product.toString());

    if (!product) {
      throw new Error("No Product found with this ID");
    }

    product.stock = product.stock - item.quantity;
    product.user = req.user.id;
    return product.save();
  });

  try {
    await Promise.all(updateStockPromises);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

  order.orderStatus = req.body.status;
  order.deliveredAt = Date.now();
  await order.save();

  res.status(200).json({
    success: true,
  });
};

// Delete order => /api/v1/admin/orders/:id
export const deleteOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ error: "No order found with this ID" });
  }

  await order.deleteOne();

  res.status(200).json({ success: true });
};
