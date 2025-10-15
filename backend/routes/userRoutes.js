const express = require("express");
const { sendOtp, verifyOtp } = require("../controllers/otpController");
const { isAuthenticated, isAdmin} = require("../middleware/authMiddleware");
const router = express.Router();
const User = require('../models/User'); // your user schema
const Order = require('../models/Order'); // your orders schema

//otp
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);




// Update user profile
router.get("/profile", isAuthenticated, async (req, res) => {
  res.render("profile", { user: req.user, orders: [] });
});


// routes/auth.js or wherever you handle auth
router.get("/logout", (req, res) => {
  // Destroy server session
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    // Optional: clear session cookie
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Logged out successfully" });
  });
});





module.exports = router;