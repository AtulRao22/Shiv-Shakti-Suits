const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  landmark: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  type: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' }
});

const userSchema = new mongoose.Schema(
  {
  name: { type: String, trim: true },
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
}],
  addresses: [addressSchema],

  },


  
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
