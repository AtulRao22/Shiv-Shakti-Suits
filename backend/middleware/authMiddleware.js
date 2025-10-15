const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  let token;

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

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
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