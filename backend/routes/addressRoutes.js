const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware: Ensure user is logged in (uses session)
function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
}

// GET all addresses
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    return res.json(user?.addresses || []);
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to load addresses' });
  }
});

// POST new address
router.post('/add', isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);

    user.addresses.push({
      fullName: req.body.fullName,
      phone: req.body.phone,
      street: req.body.street, // correct field name per schema
      landmark: req.body.landmark,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      type: req.body.type
    });

    await user.save();
    return res.json({ success: true, addresses: user.addresses });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to save address' });
  }
});

// PUT update address
router.put('/:id', isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    const addr = user.addresses.id(req.params.id);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });

    addr.fullName = req.body.fullName;
    addr.phone = req.body.phone;
    addr.street = req.body.street;
    addr.landmark = req.body.landmark;
    addr.city = req.body.city;
    addr.state = req.body.state;
    addr.pincode = req.body.pincode;
    addr.type = req.body.type;

    await user.save();
    return res.json({ success: true, address: addr });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to update address' });
  }
});

// DELETE address
router.delete('/:id', isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    const addr = user.addresses.id(req.params.id);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });
    addr.remove();
    await user.save();
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to delete address' });
  }
});

module.exports = router;
