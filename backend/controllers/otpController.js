const jwt = require("jsonwebtoken");
const User = require("../models/User");
const axios = require("axios");

let otpStore = {}; // temporary, use Redis or DB in production

//JwT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // token valid for 30 days
  });
};


// Send OTP
const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: "Mobile number required" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[mobile] = otp;

     const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/SMS/${mobile}/${otp}/OTP_SHIVSHAKTI`
    );

    console.log("2Factor Response:", response.data);
    console.log(`✅ OTP sent to ${mobile}: ${otp}`);

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("2Factor Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};


// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (otpStore[mobile] !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check if user exists, else create
    let user = await User.findOne({ mobile });
    if (!user) {
      user = await User.create({
        name: "User_" + mobile,
        mobile,
      });
    }

    // Optionally, mark specific numbers as admin
    const adminNumbers = process.env.adminNumbers || ""; // comma-separated list in .env
    if (adminNumbers.includes(mobile)) {
      user.isAdmin = true;
      await user.save();
    }

    // Set session and cookie
    req.session.user = {
      _id: user._id,
      mobile: user.mobile,
      isAdmin: user.isAdmin,
    };

    res.cookie("userId", user._id.toString(), {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const token = generateToken(user._id);

    // Clear OTP after verification
    delete otpStore[mobile];

    res.json({
      message: "OTP verified, login success",
      token,
      user: {
        _id: user._id,
        name: user.name || "Guest",
        mobile: user.mobile,
        isAdmin: user.isAdmin || false,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};


module.exports = { sendOtp, verifyOtp };
