const express = require("express");
const { sendOtp, verifyOtp } = require("../controllers/otpController");
const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware");
const router = express.Router();
const User = require('../models/User'); // your user schema
const Order = require('../models/Order'); // your orders schema

//otp
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);







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

// Update user profile name
router.put("/update", isAuthenticated, async (req, res) => {
  try {

    const userId = req.user ? req.user._id : (req.session && req.session.user && req.session.user._id);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found in DB for ID:", userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }


    if (req.body.name) {
      user.name = req.body.name.trim();
      await user.save();

      // Update name in session too if session exists
      if (req.session && req.session.user) {
        req.session.user.name = user.name;
        req.session.save(err => {
          if (err) {
            console.error("Session save error:", err);
          }
          return res.json({ success: true, message: "Profile updated successfully", name: user.name });
        });
      } else {
        return res.json({ success: true, message: "Profile updated successfully", name: user.name });
      }
    } else {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
  } catch (error) {
    console.error("Failed to update profile name:", error);
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
});

module.exports = router;