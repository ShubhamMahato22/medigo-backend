// =====================================================
// controllers/userController.js - User Controller
// Handles the logic for user-related API requests
// =====================================================

const User = require("../models/User");

// ---------------------------------------------------
// GET /api/users
// Get all users from the database
// ---------------------------------------------------
const getAllUsers = async (req, res) => {
  try {
    // Find all users in the database
    const users = await User.find();

    // Send the users as a JSON response
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    // If something goes wrong, send an error response
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// ---------------------------------------------------
// POST /api/users/register
// Register a new user
// ---------------------------------------------------
const registerUser = async (req, res) => {
  try {
    // Get user data from the request body
    const { name, email, password, phone, address } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    // Create a new user in the database
    // NOTE: In real apps, always hash the password before saving!
    const newUser = await User.create({ name, email, password, phone, address });

    // Send the created user as response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// ---------------------------------------------------
// POST /api/users/login
// Login a user (placeholder - no real auth logic here)
// ---------------------------------------------------
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Simple check (in real apps use bcrypt + JWT)
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

// Export all controller functions
module.exports = { getAllUsers, registerUser, loginUser };
