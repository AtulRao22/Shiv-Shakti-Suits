const mongoose = require("mongoose");
const Product = require("./Product");


const orderSchema = new mongoose.Schema({
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      size: { type: String, required: true },
      qty: { type: Number, required: true, default: 1 },
      priceAtPurchase: { type: Number, required: true }
    }
  ],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'Pending' },
  total: Number,
  shippingAddress: {
    fullName: String,
    phone: String,
    street: String,
    landmark: String,
    city: String,
    state: String,
    pincode: String
  },
  mobileNumber: String,
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for optimized queries
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
