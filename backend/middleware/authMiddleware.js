const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  let token;

  // 1. Check Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).lean();
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // 2. Fallback: Check session for browser-based navigation
  if (req.session && req.session.user) {
    try {
      req.user = await User.findById(req.session.user._id).lean();
      if (req.user) {
        return next();
      }
    } catch (err) {
      console.error("Session auth user fetch error:", err);
    }
  }

  // 3. Unauthorized: handle based on HTML acceptance
  const acceptsHTML = req.headers.accept && req.headers.accept.includes("text/html");
  if (acceptsHTML) {
    return res.redirect("/?login=true");
  }
  return res.status(401).json({ message: "Not authorized, no token" });
};

//Admin only
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.isAdmin) {
    next(); // allow access
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

module.exports = { isAuthenticated, isAdmin};