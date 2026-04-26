
require("dotenv").config();


const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());

app.use(express.json());

connectDB();


app.use("/api/users", userRoutes);


app.use("/api/medicines", medicineRoutes);

app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

const path = require("path");

// ABSOLUTE path fix
const assetsPath = path.resolve(__dirname, "../frontend/assets");

console.log("Serving static from:", assetsPath);

app.use("/assets", express.static(assetsPath));


app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Online Medicine Store API",
    version: "1.0.0",
    routes: ["/api/users", "/api/medicines", "/api/orders"],
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
