const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { isAuthenticated } = require("../middleware/authMiddleware");
const Order = require("../models/Order");


router.get("/", async (req, res) => {
  try {
    const products = await Product.find(); // fetch all products

    // Group products by tags
    const groupedProducts = {};
    products.forEach(p => {
      if (p.tags && p.tags.length) {
        p.tags.forEach(tag => {
          if (!groupedProducts[tag]) groupedProducts[tag] = [];
          groupedProducts[tag].push(p);
        });
        
      }
    });
       const wishlist = req.session.wishlist || [];

    // Send both to EJS
    res.render("index", { products, groupedProducts, wishlist });
  } catch (err) {
    console.error(err);
    res.render("index", { products: [], groupedProducts: {} });
  }
});

// Category page
router.get("/category/:name", async (req, res) => {
  try {
    const categoryName = req.params.name;
    let products;

    const lowerName = categoryName.toLowerCase();
    if (lowerName === "newarrival" || lowerName === "newarrivals") {
      const twentyDaysAgo = new Date();
      twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
      products = await Product.find({
        createdAt: { $gte: twentyDaysAgo }
      }).sort({ createdAt: -1 });
    } else if (lowerName === "bestseller" || lowerName === "bestsellers") {
      products = await Product.find().sort({ totalOrders: -1 });
    } else {
      products = await Product.find(
        lowerName === "all"
          ? {}
          : { category: { $regex: new RegExp("^" + categoryName + "$", "i") } }
      );
    }

    // Count products
    const productCount = products.length;

    res.render("category", {
      categoryName,
      products,
      productCount,
      wishlist: req.session.wishlist || []
    });
  } catch (err) {
    console.error("Error loading category:", err);
    res.status(500).send("Server Error");
  }
});



// Profile page
router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.product")
      .sort({ createdAt: -1 })
      .lean();
    res.render("profile", { user: req.user, orders });
  } catch (err) {
    console.error("Error loading user profile orders:", err);
    res.render("profile", { user: req.user, orders: [] });
  }
});

module.exports = router;
