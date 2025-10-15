// Ensure you have the 'crypto' module imported at the top of your file
const crypto = require("crypto");
const Order = require('../models/Order');

// POST /api/razorpay/webhook
// Note: This endpoint should not use any authentication middleware like 'isAuthenticated'
router.post('/razorpay/webhook', (req, res) => {
  // Get the signature from the request headers
  const razorpaySignature = req.headers['x-razorpay-signature'];

  // Generate a hash of the raw request body using your webhook secret
  const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
                                   .update(JSON.stringify(req.body))
                                   .digest("hex");

  // Compare the generated hash with the received signature
  if (generatedSignature !== razorpaySignature) {
    console.error("Webhook signature mismatch. Request rejected.");
    return res.status(400).send('Invalid Signature');
  }

  // --- Signature is valid, now process the payload ---
  const event = req.body.event;

  // We are only interested in 'payment.captured' or 'order.paid' events
  if (event === 'payment.captured' || event === 'order.paid') {
    const payment = req.body.payload.payment.entity;
    const orderId = payment.order_id;
    const razorpayPaymentId = payment.id;
    const orderAmount = payment.amount;

    // Use a transaction or a better query to prevent race conditions
    Order.findOneAndUpdate(
      { razorpayOrderId: orderId },
      { status: 'paid', razorpayPaymentId: razorpayPaymentId },
      { new: true }
    ).then(() => {
      console.log(`Payment captured for order ID: ${orderId}`);
      // Add logic here to fulfill the order (e.g., send a confirmation email, update inventory)
    }).catch(err => {
      console.error(`Error updating order ${orderId}:`, err);
    });
  }

  // A 200 OK response is crucial to prevent Razorpay from retrying the webhook
  res.status(200).send('OK');
});

module.exports = router;