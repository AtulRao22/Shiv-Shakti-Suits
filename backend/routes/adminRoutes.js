const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { isAdmin } = require("../middleware/authMiddleware");



// Apply admin check to all routes
router.use(isAdmin);

// Dashboard
router.get('/dashboard', isAdmin,async(req, res) => {
  try {
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const userCount = await User.countDocuments();

    res.render('admin/dashboard', {
      user: req.session.user, // pass user info to EJS
      productCount,
      orderCount,
      userCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Products page
router.get('/products',isAdmin, async (req, res) => {
  try {
    const products = await Product.find();
    res.render('admin/products', { products, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Show Add Product form
router.get("/add-product", isAdmin, (req, res) => {
  res.render("admin/addProduct", { user: req.session.user });
});

// Orders page
router.get('/orders', isAdmin,async (req, res) => {
  try {
    const orders = await Order.find().populate('user').populate('products');
    res.render('admin/orders', { orders, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Users page
router.get('/users',isAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.render('admin/users', { users, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
