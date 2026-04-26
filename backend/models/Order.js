// =====================================================
// models/Order.js - Order Schema (MongoDB Model)
// =====================================================

const mongoose = require("mongoose");

// Define the Order Schema
const orderSchema = new mongoose.Schema(
  {
    // Reference to the User who placed this order
    // mongoose.Schema.Types.ObjectId links to the User model
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Links to the User model
      required: true,
    },

    // List of medicines in the order
    // Each item has a medicine reference and the quantity ordered
    items: [
      {
        medicine: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine", // Links to the Medicine model
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],

    // Total amount to be paid
    totalAmount: {
      type: Number,
      required: true,
    },

    // Delivery address for this specific order
    deliveryAddress: {
      type: String,
      required: true,
    },

    // Status of the order
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Export the model
module.exports = mongoose.model("Order", orderSchema);
