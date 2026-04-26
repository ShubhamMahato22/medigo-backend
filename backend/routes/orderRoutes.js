// =====================================================
// routes/orderRoutes.js - Order API Routes
// Defines all endpoints related to orders
// =====================================================

const express = require("express");
const router = express.Router();

// Import controller functions
const { getAllOrders, placeOrder, getOrderById, updateOrderStatus } = require("../controllers/orderController");

// ---------------------------------------------------
// Define Routes
// ---------------------------------------------------

// GET  /api/orders       → Get all orders
router.get("/", getAllOrders);

// POST /api/orders       → Place a new order
router.post("/", placeOrder);

// GET  /api/orders/:id   → Get a single order by ID
router.get("/:id", getOrderById);

// PUT  /api/orders/:id   → Update order status (Admin)
router.put("/:id", updateOrderStatus);

// Export the router
module.exports = router;
