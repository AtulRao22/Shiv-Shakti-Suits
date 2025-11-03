const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");

let otpStore = {}; // Temporary storage (use Redis or DB in production)

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Configure Brevo client
const brevoClient = SibApiV3Sdk.ApiClient.instance;
brevoClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

// Create email API instance
const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();



// Send OTP to email
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email address is required" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;

    // Automatically delete OTP after 10 minutes (600,000 ms)
    setTimeout(() => {
      delete otpStore[email];
      console.log(`🕒 OTP for ${email} expired and removed.`);
    }, 10 * 60 * 1000);

     // Send via Brevo
    await emailApi.sendTransacEmail({
      sender: { name: "Shiv Shakti Suits", email: "002atulrao@gmail.com" },
      to: [{ email }],
      subject: "Your OTP for Login",
      textContent: `Your login OTP is ${otp}. It will expire in 10 minutes.`,
    });

    console.log(`✅ OTP sent to ${email}: ${otp}`);
    res.json({ success: true, message: "OTP sent successfully to email" });
  } catch (error) {
    console.error("Email send error:", error.message);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};


// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!otpStore[email] || otpStore[email] !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check if user exists, else create new
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: email.split("@")[0], // default name before '@'
        email,
      });
    }

    // Optionally, mark specific emails as admin
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",");
    if (adminEmails.includes(email)) {
      user.isAdmin = true;
      await user.save();
    }

    // Set session and cookie
    req.session.user = {
      _id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    res.cookie("userId", user._id.toString(), {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const token = generateToken(user._id);

    // Clear OTP
    delete otpStore[email];

    res.json({
      message: "OTP verified, login successful",
      token,
      user: {
        _id: user._id,
        name: user.name || "Guest",
        email: user.email,
        isAdmin: user.isAdmin || false,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendOtp, verifyOtp };
