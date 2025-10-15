const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const User = require("../models/User");
const mongoose = require("mongoose");

// ✅ Initialize wishlist in session for guests
router.use((req, res, next) => {
  if (!req.session.wishlist) req.session.wishlist = [];
  next();
});

// ✅ Toggle wishlist (add/remove)
router.post("/toggle/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 🧠 If user logged in → save in MongoDB
    if (req.session.user && req.session.user._id) {
      const user = await User.findById(req.session.user._id);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      const index = user.wishlist.findIndex(
        id => id.toString() === productId.toString()
      );

      if (index > -1) {
        // remove
        user.wishlist.splice(index, 1);
        await user.save();
        return res.json({ success: true, inWishlist: false });
      } else {
        // add
        user.wishlist.push(productId);
        await user.save();
        return res.json({ success: true, message: "Added to wishlist", inWishlist: true });
      }
    }

    // 🧠 Guest user → store in session
    const index = req.session.wishlist.findIndex(p => p._id === productId);

    if (index > -1) {
      req.session.wishlist.splice(index, 1);
      return res.json({ success: true, inWishlist: false });
    } else {
      req.session.wishlist.push({
        _id: product._id.toString(),
        name: product.name,
        salePrice: product.salePrice,
        mrp: product.mrp,
        image: product.images && product.images.length ? product.images[0] : "",
        discount: product.discount,
      });
      return res.json({ success: true, message: "Added to wishlist", inWishlist: true });
    }
  } catch (err) {
    console.error("Wishlist toggle error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Wishlist page
router.get("/", async (req, res) => {
  try {
    let wishlistProducts = [];

    // Logged-in user
    if (req.session.user && req.session.user._id) {
      const user = await User.findById(req.session.user._id).populate("wishlist");
      wishlistProducts = user?.wishlist || [];
    } 
    // Guest user
    else {
      const wishlistIds = (req.session.wishlist || []).map(item => item._id);
      wishlistProducts = await Product.find({ _id: { $in: wishlistIds } });
    }

    res.render("wishlist", { wishlist: wishlistProducts });
  } catch (err) {
    console.error("Wishlist page error:", err);
    res.render("wishlist", { wishlist: [] });
  }
});

// ✅ Get wishlist as JSON (for frontend)
router.get("/json", async (req, res) => {
  try {
    if (req.session.user && req.session.user._id) {
      const user = await User.findById(req.session.user._id);
      return res.json({ wishlist: user?.wishlist || [] });
    } else {
      const wishlistIds = (req.session.wishlist || []).map(item => item._id.toString());
      return res.json({ wishlist: wishlistIds });
    }
  } catch (err) {
    console.error("Wishlist JSON error:", err);
    res.json({ wishlist: [] });
  }
});

// ✅ Remove manually
router.post("/remove/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    // Logged in user
    if (req.session.user && req.session.user._id) {
      const user = await User.findById(req.session.user._id);
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
      await user.save();
      return res.json({ success: true });
    }

    // Guest user
    req.session.wishlist = (req.session.wishlist || []).filter(p => p._id !== productId);
    res.json({ success: true, });
  } catch (err) {
    console.error("Wishlist remove error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// Wishlist Count (works for both logged-in and guest users)
router.get("/count", async (req, res) => {
  try {
    let count = 0;

    // Logged-in user
    if (req.session.user && req.session.user._id) {
      const user = await User.findById(req.session.user._id).populate("wishlist.product");
      count = Array.isArray(user?.wishlist) ? user.wishlist.length : 0;
    } 
    // Guest user
    else {
      count = Array.isArray(req.session.wishlist) ? req.session.wishlist.length : 0;
    }

    return res.json({ count });
  } catch (err) {
    console.error("Error in /wishlist/count:", err);
    return res.status(500).json({ count: 0 });
  }
});



module.exports = router;
