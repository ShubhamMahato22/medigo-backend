// =====================================================
// models/User.js - User Schema (MongoDB Model)
// =====================================================

const mongoose = require("mongoose");

// Define the User Schema
// A schema tells MongoDB what fields a User document should have
const userSchema = new mongoose.Schema(
  {
    // User's full name
    name: {
      type: String,
      required: true, // This field is mandatory
    },

    // User's email address (must be unique)
    email: {
      type: String,
      required: true,
      unique: true, // No two users can have the same email
    },

    // User's password (in real apps, this should be hashed)
    password: {
      type: String,
      required: true,
    },

    // User's phone number (optional)
    phone: {
      type: String,
    },

    // User's delivery address (optional)
    address: {
      type: String,
    },

    // Role of the user: 'customer' or 'admin'
    role: {
      type: String,
      enum: ["customer", "admin"], // Only these two values are allowed
      default: "customer",         // Default value is 'customer'
    },
  },
  {
    // Automatically adds createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Export the model so it can be used in other files
module.exports = mongoose.model("User", userSchema);
