// =====================================================
// routes/userRoutes.js - User API Routes
// Defines all endpoints related to users
// =====================================================

const express = require("express");

// Create a router object
const router = express.Router();

// Import controller functions
const { getAllUsers, registerUser, loginUser } = require("../controllers/userController");

// ---------------------------------------------------
// Define Routes
// ---------------------------------------------------

// GET  /api/users         → Get all users
router.get("/", getAllUsers);

// POST /api/users/register → Register a new user
router.post("/register", registerUser);

// POST /api/users/login   → Login a user
router.post("/login", loginUser);

// Export the router so it can be used in server.js
module.exports = router;
