const express = require('express');
const router  = express.Router();
const path    = require('path');
const Product = require('../models/Product');
const Order   = require('../models/Order');
const User    = require('../models/User');
const { isAdmin } = require('../middleware/authMiddleware');

// Guard every /admin/* route
router.use(isAdmin);

// ═══════════════════════════════════════════════════════════════════════════
// JSON API endpoints  (consumed by the React admin SPA)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /admin/api/stats
 * Returns dashboard statistics as JSON.
 */
router.get('/api/stats', async (req, res) => {
  try {
    const [productCount, orderCount, userCount] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
    ]);

    const websiteTraffic = req.app.locals.visitors || 0;

    // Compute total revenue from Paid + Delivered orders
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['Paid', 'Delivered'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Last 5 orders for the recent-orders table on the dashboard
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      totalRevenue,
      totalUsers:    userCount,
      totalOrders:   orderCount,
      totalProducts: productCount,
      websiteTraffic,
      recentOrders,
    });
  } catch (err) {
    console.error('[admin/api/stats]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /admin/api/orders
 * Returns full orders list as JSON.
 */
router.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user')
      .populate('products.product')
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (err) {
    console.error('[admin/api/orders]', err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Shared POST routes  (used by both EJS and React)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /admin/orders/:id/status
 * Updates an order's status. Returns JSON (used by React).
 */
router.post('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Placed', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({ success: true, order });
  } catch (err) {
    console.error('[admin/orders/:id/status]', err);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Catch-all GET — serves the React admin SPA for all /admin/* page routes
// IMPORTANT: This must always be the LAST route in this file.
// ═══════════════════════════════════════════════════════════════════════════
router.get('*', (req, res) => {
  res.sendFile(
    path.resolve(__dirname, '../../public/admin-panel/dist/index.html')
  );
});

module.exports = router;
