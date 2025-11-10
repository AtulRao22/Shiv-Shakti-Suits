const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { isAdmin } = require("../middleware/authMiddleware");

// Apply admin check to all routes
router.use(isAdmin);

// Dashboard
router.get('/dashboard', async (req, res) => {
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
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('admin/products', { products, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Show Add Product form
router.get("/add-product", (req, res) => {
  res.render("admin/addProduct", { user: req.session.user });
});

// Orders page
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user')
      .populate('products')
      .sort({ createdAt: -1 })
      .lean();

    res.render('admin/orders', { orders, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Update order status (admin only, session-based)
router.post('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // e.g. 'Placed', 'Paid', 'Shipped', 'Delivered', 'Cancelled'
    const allowed = ['Placed', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// Users page
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.render('admin/users', { users, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
