const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

function requireLogin(req, res, next) {
  if (req.session && req.session.user) return next();
  // If called via fetch expecting JSON, return JSON 401 so frontend can react
  const wantsJSON = (req.headers['content-type'] || '').includes('application/json') || (req.headers['accept'] || '').includes('application/json');
  if (wantsJSON) {
    return res.status(401).json({ success: false, message: 'Not logged in', redirect: '/login' });
  }
  return res.redirect('/login');
}

/**
 * 1. Buy Now from Product Show
 * POST /buy/product/:id
 */
router.post("/buy/product/:id", requireLogin, async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const chosenSize = (req.body && req.body.size) ? req.body.size : (product.size || "M");

    req.session.checkout = {
      items: [
        {
          _id: product._id,
          name: product.name,
          discount: product.discount,
          salePrice: product.salePrice,
          mrp: product.mrp,
          image: product.imageUrls?.[0] || "/images/placeholder.png",
          size: chosenSize,
          qty: 1
        }
      ]
    };

    res.json({ success: true, redirect: "/checkout" });
  } catch (err) {
    console.error("Buy Now (Product):", err);
    res.status(500).json({ success: false, message: "Error in Buy Now" });
  }
});

/**
 * Normalize cart items for both guest (session) and logged-in (DB) users
 */
async function getCartItems(req) {
  // Logged-in user -> read from DB cart and normalize
  if (req.session.user && req.session.user._id) {
    const user = await User.findById(req.session.user._id).populate('cart.product');
    const list = Array.isArray(user?.cart) ? user.cart : [];
    return list.map(item => ({
      _id: (item.product?._id || item.product).toString(),
      name: item.product?.name || 'Product',
      salePrice: item.product?.salePrice || 0,
      mrp: item.product?.mrp || 0,
      discount: item.product?.discount || 0,
      image: (item.product?.imageUrls && item.product.imageUrls[0]) ? item.product.imageUrls[0] : '/images/placeholder.png',
      qty: item.qty || 1,
      size: item.size || 'M'
    }));
  }
  // Guest -> from session cart as-is
  return (req.session.cart || []).map(p => ({
    _id: p._id,
    name: p.name,
    salePrice: p.salePrice,
    mrp: p.mrp,
    discount: p.discount,
    image: p.image || '/images/placeholder.png',
    qty: p.qty,
    size: p.size
  }));
}

/**
 * 2. Buy Now from Cart (single item)
 * POST /buy/cart/:id
 */
router.post("/buy/cart/:id", requireLogin, async (req, res) => {
  try {
    const productId = req.params.id;
    const cart = await getCartItems(req);

    const item = cart.find(p => p._id.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not in cart" });
    }

    req.session.checkout = { items: [item] };
    return res.json({ success: true, redirect: "/checkout" });
  } catch (err) {
    console.error("Buy Now (Cart):", err);
    return res.status(500).json({ success: false, message: "Error in Cart Buy Now" });
  }
});

/**
 * 3. Checkout all cart items
 * POST /checkout/all
 */
router.post("/checkout/all", requireLogin, async (req, res) => {
  try {
    const cart = await getCartItems(req);

    if (!cart.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    req.session.checkout = { items: cart };
    return res.json({ success: true, redirect: "/checkout" });
  } catch (err) {
    console.error("Checkout All:", err);
    return res.status(500).json({ success: false, message: "Error in Checkout All" });
  }
});

/**
 * Render Checkout Page
 */
router.get("/checkout", requireLogin, async (req, res) => {
  const checkoutData = req.session.checkout || {};

  if (!checkoutData.items || checkoutData.items.length === 0) {
    return res.redirect("/cart");
  }

  const user = await User.findById(req.session.user._id);

  res.render("checkout", {
    cart: checkoutData.items,
    data: checkoutData,
    addresses: user ? user.addresses : [],
    user,
  });
});

function computeTotal(items = []) {
  return items.reduce((acc, item) => acc + (item.salePrice * item.qty), 0);
}

/**
 * Proceed to Pay (COD)
 * POST /checkout/place-order
 */
router.post("/checkout/place-order", requireLogin, async (req, res) => {
  try {
    const checkoutData = req.session.checkout;

    if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
      return res.redirect("/cart");
    }

    const totalAmount = computeTotal(checkoutData.items);

    // Map to existing Order schema (products, user, total, status)
    const order = new Order({
      products: checkoutData.items.map(i => i._id),
      user: req.session.user._id,
      total: totalAmount,
      status: "Placed",
    });

    await order.save();

    // Clear checkout session
    req.session.checkout = null;

    return res.redirect("/checkout/success");
  } catch (err) {
    console.error("Place Order:", err);
    return res.status(500).send("Error placing order");
  }
});

/**
 * Create Razorpay order (Online Payment)
 */
router.post('/payment/razorpay/create-order', requireLogin, async (req, res) => {
  try {
    const items = req.session.checkout?.items || [];
    if (!items.length) return res.status(400).json({ success: false, message: 'Empty checkout' });

    const amount = computeTotal(items) * 100; // in paise
    const options = { amount, currency: 'INR', receipt: 'rcpt_' + Date.now() };
    const order = await razorpay.orders.create(options);

    return res.json({ success: true, key: process.env.RAZORPAY_KEY_ID, orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (e) {
    console.error('RZP create-order error', e);
    return res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
});

/**
 * Verify Razorpay payment and create Order
 */
router.post('/payment/razorpay/verify', requireLogin, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const digest = hmac.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const items = req.session.checkout?.items || [];
    if (!items.length) return res.status(400).json({ success: false, message: 'Empty checkout' });

    const totalAmount = computeTotal(items);

    const order = new Order({
      products: items.map(i => i._id),
      user: req.session.user._id,
      total: totalAmount,
      status: 'Paid'
    });
    await order.save();

    req.session.checkout = null;
    return res.json({ success: true, redirect: '/checkout/success' });
  } catch (e) {
    console.error('RZP verify error', e);
    return res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});

/**
 * Success Page
 */
router.get("/checkout/success", (req, res) => {
  res.render("order-success");
});

module.exports = router;
