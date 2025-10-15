const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const User = require("../models/User");
const mongoose = require("mongoose");

// Helper to get product id string whether populated or not
const getProductId = (item) => {
  if (!item || item.product == null) return null;
  // if populated doc: use product._id
  if (item.product._id) return item.product._id.toString();
  // if it's an ObjectId or string
  return item.product.toString();
};

// Initialize session cart for guests
router.use((req, res, next) => {
  if (!req.session.cart) req.session.cart = [];
  next();
});

// Add product to cart
router.post("/add/:id", async (req, res) => {
  const productId = req.params.id;
  const { size } = req.body;

  if (!size) return res.status(400).json({ success: false, message: "Size is required" });

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

     // ✅ Validate size exists in variants and has stock > 0
    const variant = product.variants.find(v => v.size === size);
    if (!variant) return res.status(400).json({ success: false, message: `Size ${size} not available` });
    if (variant.stock <= 0) return res.status(400).json({ success: false, message: `Size ${size} is out of stock` });

    // Logged-in user
    if (req.session.user && req.session.user._id) {
      const user = await User.findById(req.session.user._id).populate("cart.product");
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      if (!user.cart) user.cart = [];

      // Check if product+size already exists — use robust getter
      const index = user.cart.findIndex(item => {
        const pid = getProductId(item);
        return pid === productId && item.size === size;
      });

      if (index === -1) {
        user.cart.push({ product: productId, size, qty: 1 });
      } else {
        // optionally increment qty if you want behavior to add more
         user.cart[index].qty = (user.cart[index].qty || 0) + 1;
      }

      await user.save();
      return res.json({ success: true, message: "Added to cart", cart: user.cart });
    }

    // Guest user
    const existing = req.session.cart.find(p => p._id === productId && p.size === size);
    if (!existing) {
      req.session.cart.push({
        _id: product._id.toString(),
        name: product.name,
        salePrice: product.salePrice,
        mrp: product.mrp,
        discount: product.discount,
        image: product.imageUrls?.[0] || "/images/placeholder.png",
        qty: 1,
        size: size
      });
    }

    res.json({ success: true, message: "Added to cart", cart: req.session.cart });

  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update quantity (+1 or -1) in cart page
router.post("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { change, size } = req.body; // size needed to identify exact item

  if (!size) return res.status(400).json({ success: false, message: "Size is required" });

  // Logged-in user
  if (req.session.user && req.session.user._id) {
    const user = await User.findById(req.session.user._id).populate("cart.product");
    if (!user || !user.cart) return res.json({ success: false, cart: [] });

    let changed = false;
    user.cart = user.cart.map(item => {
      const pid = getProductId(item);
      if (pid === id && item.size === size) {
        const newQty = Math.max(1, (item.qty || 1) + Number(change || 0));
        if (newQty !== item.qty) changed = true;
        item.qty = newQty;
      }
      return item;
    });

    if (changed) await user.save();
    return res.json({ success: true, changed, cart: user.cart });
  }

  // Guest
  let changed = false;
  req.session.cart = (req.session.cart || []).map(item => {
    if (item._id === id && item.size === size) {
      const newQty = Math.max(1, (item.qty || 1) + Number(change || 0));
      if (newQty !== item.qty) changed = true;
      item.qty = newQty;
    }
    return item;
  });

  return res.json({ success: true, changed, cart: req.session.cart });
});

// Remove product from cart
router.post("/remove/:id", async (req, res) => {
  const { id } = req.params;
  const { size } = req.body;

  if (!size) return res.status(400).json({ success: false, message: "Size is required" });

  // Logged-in user
  if (req.session.user && req.session.user._id) {
    const user = await User.findById(req.session.user._id).populate("cart.product");
    if (!user || !user.cart) return res.json({ success: false, cart: [] });

    const before = user.cart.length;
    user.cart = user.cart.filter(item => {
      const pid = getProductId(item);
      return !(pid === id && item.size === size);
    });
    const after = user.cart.length;
    if (after !== before) await user.save();
    return res.json({ success: true, cart: user.cart });
  }

  // Guest
  const before = (req.session.cart || []).length;
  req.session.cart = (req.session.cart || []).filter(item => !(item._id === id && item.size === size));
  const after = req.session.cart.length;
  return res.json({ success: true, cart: req.session.cart, removed: before !== after });
});

// Cart page
router.get("/", async (req, res) => {
  let cartProducts = [];

  if (req.session.user && req.session.user._id) {
    const user = await User.findById(req.session.user._id).populate("cart.product");
    if (user?.cart) {
      cartProducts = user.cart.map(item => (({
        _id: getProductId(item),
        name: item.product?.name || "Product",
        salePrice: item.product?.salePrice || 0,
        mrp: item.product?.mrp || 0,
        discount: item.product?.discount || 0,
        image: item.product?.imageUrls?.[0] || "/images/placeholder.png",
        qty: item.qty,
        size: item.size
      })));
    }
  } else {
    cartProducts = (req.session.cart || []).map(p => ({
      _id: p._id,
      name: p.name,
      salePrice: p.salePrice,
      mrp: p.mrp,
      discount: p.discount,
      image: p.image || "/images/placeholder.png",
      qty: p.qty,
      size: p.size
    }));
  }

  res.render("cart", { cart: cartProducts });
});

// Cart Count Route
router.get("/count", async (req, res) => {
  try {
    let count = 0;

    // Logged-in user
    if (req.session.user && req.session.user._id) {
      const user = await User.findById(req.session.user._id).populate("cart.product");
      count = Array.isArray(user?.cart) ? user.cart.length : 0;
    } 
    // Guest user
    else {
      count = Array.isArray(req.session.cart) ? req.session.cart.length : 0;
    }

    return res.json({ count });
  } catch (err) {
    console.error("Error in /cart/count:", err);
    return res.status(500).json({ count: 0 });
  }
});




module.exports = router;
