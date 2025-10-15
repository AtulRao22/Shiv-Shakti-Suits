const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
    if (!mobile) return res.status(400).json({ message: "Mobile number required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[mobile] = otp;

    console.log(`OTP for ${mobile}: ${otp}`); // Replace with SMS API like Twilio/MSG91
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (otpStore[mobile] !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if user exists, else create
    let user = await User.findOne({ mobile });
    if (!user) {
      user = await User.create({
        name: "User_" + mobile,
        mobile,
      });
    }

    // Optionally, mark a specific number as admin
    const adminNumbers = ["6367087570"]; // List of admin numbers
    if (adminNumbers.includes(mobile)) {
      user.isAdmin = true;
      await user.save();
    }

    // Set session and cookie
     req.session.user = { _id: user._id, mobile: user.mobile, isAdmin: user.isAdmin };
     res.cookie("userId", user._id.toString(), { httpOnly: true, maxAge: 7*24*60*60*1000 });


    const token = generateToken(user._id);

    delete otpStore[mobile]; // Clear OTP after use

    res.json({
      message: "OTP verified, login success",
      token,
      user: {
        _id: user._id,
        name: user.name || "Guest",
        mobile: user.mobile,
        isAdmin: user.isAdmin || false, // Pass isAdmin to frontend
      },
      
    });
   
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { sendOtp, verifyOtp };
