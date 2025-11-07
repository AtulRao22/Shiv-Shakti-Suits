// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  mrp: {  // Maximum Retail Price
    type: Number,
    required: true,
    min: 0
  },
  salePrice: {  // Discounted price
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },

  // Multiple images
  imageUrls: [{ type: String }],

  // Product Variants (color + size + stock)
  variants: [
    {
      size: String,
      stock: { type: Number, default: 0 }
    }
  ],

  // Product Details 
  details: {
    topType: String,
    neckline: String,
    topPattern: String,
    sleeveType: String,
    bottomType: String,
    dupattaStole: String,
    fit: String,
    fabric: String
  },

  // Tags / Labels
  tags: [{ type: String }],

  // For auto bestseller detection
  totalOrders: { type: Number, default: 0 },

  // Rating fields
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Product", productSchema);
