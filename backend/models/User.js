const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
  type: String,
  required: true,
  unique: true,
  match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
},

    isAdmin: { type: Boolean, default: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    cart: [{
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  size: { type: String, required: true },
  qty: { type: Number, default: 1 }
}]

  },
  
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
