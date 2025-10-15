const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
// const Order = require("../models/Order");  ✅ You’ll need an Order model

/**
 * 1. Buy Now from Product Show
 * POST /buy/product/:id
 */
router.post("/buy/product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    req.session.checkout = {
      items: [
        {
          _id: product._id,
          name: product.name,
          discount: product.discount,
          salePrice: product.salePrice,
          mrp: product.mrp,
          image: product.imageUrls?.[0] || "/images/placeholder.png",
          qty: 1
        }
      ]
    };

    res.json({ success: true, redirect: "/checkout" });
  } catch (err) {
    console.error("Buy Now (Product):", err);
    res.status(500).json({ success: false, message: "Error in Buy Now" });
  }
});

/**
 * 2. Buy Now from Cart (single item)
 * POST /buy/cart/:id
 */
router.post("/buy/cart/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const cart = req.session.cart || [];

    const item = cart.find(p => p._id.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not in cart" });
    }

    req.session.checkout = {
      items: [item]
    };

    res.json({ success: true, redirect: "/checkout" });
  } catch (err) {
    console.error("Buy Now (Cart):", err);
    res.status(500).json({ success: false, message: "Error in Cart Buy Now" });
  }
});

/**
 * 3. Checkout all cart items
 * POST /checkout/all
 */
router.post("/checkout/all", (req, res) => {
  try {
    const cart = req.session.cart || [];

    if (!cart.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    req.session.checkout = {
      items: cart
    };

    res.json({ success: true, redirect: "/checkout" });
  } catch (err) {
    console.error("Checkout All:", err);
    res.status(500).json({ success: false, message: "Error in Checkout All" });
  }
});

/**
 * Render Checkout Page
 */
router.get("/checkout", (req, res) => {
  const checkoutData = req.session.checkout || {};

  if (!checkoutData.items || checkoutData.items.length === 0) {
    return res.redirect("/cart");
  }

  res.render("checkout", {
    cart: checkoutData.items,
    data: checkoutData
  });
});

/**
 * Proceed to Pay (Confirm Order)
 * POST /checkout/place-order
 */
router.post("/checkout/place-order", async (req, res) => {
  try {
    const checkoutData = req.session.checkout;

    if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
      return res.redirect("/cart");
    }

    // Calculate total
    const totalAmount = checkoutData.items.reduce(
      (acc, item) => acc + (item.price * item.qty),
      0
    );

    // Create new order
    const order = new Order({
      items: checkoutData.items,
      address: checkoutData.address || {}, // address from session (extend later)
      paymentMethod: req.body.paymentMethod || "COD",
      totalAmount,
      status: "Placed"
    });

    await order.save();

    // Clear checkout session
    req.session.checkout = null;

    res.redirect("/checkout/success");
  } catch (err) {
    console.error("Place Order:", err);
    res.status(500).send("Error placing order");
  }
});

/**
 * Success Page
 */
router.get("/checkout/success", (req, res) => {
  res.render("order-success"); // you can pass order data if needed
});

module.exports = router;
