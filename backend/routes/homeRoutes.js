const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const wishlist = require("./wishlistRoutes");

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

    // Fetch products (all or by category)
    const products = await Product.find(
      categoryName === "all" ? {} : { category: categoryName }
    );

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


module.exports = router;
