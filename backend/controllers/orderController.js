
// controllers/orderController.js - Order Controller
// Handles the logic for order-related API requests

const Order = require("../models/Order");

// GET /api/orders
// Get all orders from the database
const getAllOrders = async (req, res) => {
  try {
    // populate() replaces IDs with actual data from related collections
    const orders = await Order.find()
      .populate("user", "name email")     // Show user's name and email
      .populate("items.medicine", "name price"); // Show medicine name and price

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// ---------------------------------------------------
// POST /api/orders
// Place a new order
// ---------------------------------------------------
const placeOrder = async (req, res) => {
  try {
    const { user, items, totalAmount, deliveryAddress } = req.body;

    // Check required fields
    if (!user || !items || !totalAmount || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required order details",
      });
    }

    const newOrder = await Order.create({
      user,
      items,
      totalAmount,
      deliveryAddress,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: newOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// ---------------------------------------------------
// GET /api/orders/:id
// Get a single order by its ID
// ---------------------------------------------------
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.medicine", "name price");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// ---------------------------------------------------
// PUT /api/orders/:id
// Update order status (Admin use)
// ---------------------------------------------------
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled"];
    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: status.toLowerCase() },
      { new: true }  // return the updated document
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// Export all controller functions
module.exports = { getAllOrders, placeOrder, getOrderById, updateOrderStatus };
