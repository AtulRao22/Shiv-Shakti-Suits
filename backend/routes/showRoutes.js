const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// ✅ Show single product page
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).render("404", { message: "Product not found" });
    }

    // ✅ Manage Recently Viewed using cookies
  // inside your product detail route (where `product` is available)
const MAX_RECENT = 5; // max items to keep in cookie

// --- read cookie robustly (handles JSON or legacy comma string) ---
let recentlyViewed = [];
if (req.cookies && req.cookies.recentlyViewed) {
  const raw = req.cookies.recentlyViewed;
  try {
    recentlyViewed = JSON.parse(raw);
    if (!Array.isArray(recentlyViewed)) recentlyViewed = [];
  } catch (err) {
    // if cookie stored as "id1,id2" fallback to splitting
    if (typeof raw === "string" && raw.includes(",")) {
      recentlyViewed = raw.split(",").map(s => s.trim()).filter(Boolean);
    } else {
      recentlyViewed = [];
    }
  }
}

// --- update list: remove current, add to front, cap ---
const curId = product._id.toString();
recentlyViewed = recentlyViewed.filter(pid => pid !== curId);
recentlyViewed.unshift(curId);
if (recentlyViewed.length > MAX_RECENT) {
  recentlyViewed = recentlyViewed.slice(0, MAX_RECENT);
}

// --- save cookie as JSON (safer) ---
res.cookie("recentlyViewed", JSON.stringify(recentlyViewed), {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true
});

// --- build array of other recent IDs (exclude current) ---
const recentIds = recentlyViewed.filter(id => id !== curId);

// --- fetch those products from DB (if any) and preserve order ---
let recentProducts = [];
if (recentIds.length > 0) {
  // .lean() returns plain objects which is slightly faster
  const found = await Product.find({ _id: { $in: recentIds } }).lean();
  // preserve the order as in recentIds
  recentProducts = recentIds.map(id => found.find(p => p._id.toString() === id)).filter(Boolean);
}



    // ✅ Fetch similar products by tags
    // Assuming `product` is the current product being viewed
const similarProducts = await Product.find({
  category: product.category,
  _id: { $ne: product._id }   // exclude current product
})
.limit(6)      // hardcoded to 6
.lean();
// send to view
 res.render("productShow", {
      product,
      recentProducts,
      similarProducts,
      variants: product.variants,
       wishlist: req.session.wishlist || [],
    });

  } catch (err) {
    console.error(err);
    res.status(500).render("500", { message: "Server error" });
  }
});




module.exports = router;
