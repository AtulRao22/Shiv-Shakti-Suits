// // At the top of your routes file, outside the route handler
// const Razorpay = require('razorpay');
// const Order = require('../models/Order');

// // Initialize Razorpay client once, not in every route handler
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // POST /api/orders
// // Use 'isAuthenticated' middleware to protect this route
// router.post('/orders', isAuthenticated, async (req, res) => {
//   try {
//     const { items, totalAmount, shippingAddress } = req.body;

//     // A better approach is to calculate the total amount on the backend
//     // to prevent tampering from the frontend.
//     // Let's assume you have a function `calculateTotal`
//     // const calculatedTotal = await calculateTotal(items);
//     // if (calculatedTotal !== totalAmount) {
//     //    return res.status(400).json({ success: false, message: "Invalid amount" });
//     // }

//     // 1. Create a new order in your database (initial status 'created')
//     const newOrder = new Order({
//       user: req.user._id, 
//       items: items,
//       shippingAddress: shippingAddress,
//       totalAmount: totalAmount,
//       status: 'created' // Use a more descriptive status like 'created' or 'pending'
//     });

//     await newOrder.save();

//     // 2. Create a corresponding order on Razorpay's server
//     const razorpayOptions = {
//       amount: totalAmount * 100, // Amount in paisa
//       currency: "INR",
//       receipt: newOrder._id.toString(), // Unique ID from your database
//       payment_capture: 1 // Automatically capture payment after success
//     };

//     const razorpayOrder = await razorpay.orders.create(razorpayOptions);

//     // 3. Update the database order with the Razorpay ID
//     // Note: You can also include this in the initial `newOrder` creation
//     newOrder.razorpayOrderId = razorpayOrder.id;
//     await newOrder.save();

//     // 4. Send the Razorpay order details to the frontend
//     res.status(201).json({ // Use 201 Created for a new resource
//       success: true,
//       orderId: razorpayOrder.id,
//       amount: razorpayOrder.amount,
//       currency: razorpayOrder.currency
//     });

//   } catch (error) {
//     console.error("Error creating order:", error.message);
//     res.status(500).json({ success: false, message: "Failed to create order. " + error.message });
//   }
// });

// module.exports = router;