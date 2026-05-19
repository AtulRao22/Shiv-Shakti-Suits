// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require("multer");
const path = require("path");
const { isAdmin } = require("../middleware/authMiddleware");

// Storage settings
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,

  params: {
    folder: "shiv-shakti-products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });



router.post("/add", upload.array("images", 5), isAdmin, async (req, res) => {
  try {
    const { name, mrp, salePrice, category, description, size } = req.body;

    // -------------------------------
    // 1️⃣ Parse Variants
    // -------------------------------
    let parsedVariants = [];
    if (req.body.variants) {
      try {
        const variantsStr = Array.isArray(req.body.variants)
          ? req.body.variants[req.body.variants.length - 1]
          : req.body.variants;
        parsedVariants = JSON.parse(variantsStr);
      } catch {
        return res.status(400).json({ success: false, error: "Invalid variants format" });
      }
    }

    // -------------------------------
    // 2️⃣ Parse Tags
    // -------------------------------
    let parsedTags = [];
    if (req.body.tags) {
      try {
        const tagsStr = Array.isArray(req.body.tags)
          ? req.body.tags[req.body.tags.length - 1]
          : req.body.tags;
        parsedTags = JSON.parse(tagsStr);
      } catch {
        return res.status(400).json({ success: false, error: "Invalid tags format" });
      }
    }

    // -------------------------------
    // 3️⃣ Parse Details
    // -------------------------------
    let parsedDetails = {};
    if (req.body.details) {
      try {
        // If details is already an object (some inputs), use it directly
        if (typeof req.body.details === "object" && !Array.isArray(req.body.details)) {
          parsedDetails = req.body.details;
        } else {
          const detailsStr = Array.isArray(req.body.details)
            ? req.body.details[req.body.details.length - 1]
            : req.body.details;
          parsedDetails = JSON.parse(detailsStr);
        }
      } catch {
        return res.status(400).json({ success: false, error: "Invalid details format" });
      }
    }

    // -------------------------------
    // 4️⃣ Map Images
    // -------------------------------
    const imageUrls = req.files.map(file => file.path);
    // -------------------------------
    // 5️⃣ Save Product
    // -------------------------------
    const product = new Product({
      name,
      mrp: Number(mrp),
      salePrice: Number(salePrice),
      size,
      category,
      description,
      variants: parsedVariants,
      tags: parsedTags,
      details: parsedDetails,
      imageUrls
    });

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ✅ Get All Products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Single Product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update Product
router.put("/:id", upload.array("images", 5), isAdmin, async (req, res) => {
  try {
    const { name, mrp, salePrice, stock, category, description, size } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (mrp !== undefined) updateData.mrp = Number(mrp);
    if (salePrice !== undefined) updateData.salePrice = Number(salePrice);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (size !== undefined) updateData.size = size;

    if (req.body.tags !== undefined) {
      if (typeof req.body.tags === "string") {
        updateData.tags = req.body.tags.split(",").map(t => t.trim()).filter(Boolean);
      } else if (Array.isArray(req.body.tags)) {
        updateData.tags = req.body.tags;
      }
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(file => "/assets/" + file.filename);
      updateData.imageUrls = imageUrls;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(400).json({ error: err.message });
  }
});

// ✅ Delete Product
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
