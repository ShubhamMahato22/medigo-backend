const jwt = require("jsonwebtoken");

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Fallbacks just in case env vars are missing, though ideally they shouldn't be
    const adminEmail = process.env.ADMIN_EMAIL || "admin@medistore.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const jwtSecret = process.env.JWT_SECRET || "your_secret_key";

    if (email === adminEmail && password === adminPassword) {
      const token = jwt.sign({ email, role: "admin" }, jwtSecret, { expiresIn: "1d" });
      return res.json({ success: true, token, role: "admin", email });
    } else {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { loginAdmin };
