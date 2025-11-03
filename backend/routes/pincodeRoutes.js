const express = require("express");
const router = express.Router();
const axios = require("axios");

// Add your serviceable pincodes here or fetch from DB
const serviceablePincodes = ["110001", "400001", "560001", "700001", "302017","333033","333026"];

router.post("/check", async (req, res) => {
  const { pincode } = req.body;

  if (!pincode || pincode.length !== 6) {
    return res.json({ success: false, message: "Please enter a valid 6-digit pincode." });
  }

  try {
    const { pincode } = req.body;

    if (!pincode || pincode.length !== 6) {
      return res.json({ success: false, message: "Please enter a valid 6-digit pincode." });
    }

    // Fetch pincode details
    const apiRes = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = apiRes.data[0];

    if (!data || data.Status !== "Success" || !data.PostOffice?.length) {
      return res.json({ success: false, message: "Invalid pincode." });
    }

    // const postOffice = data.PostOffice[0];
    // const { Name: Area, District, State } = postOffice;

     let mainOffice = data.PostOffice.find(po => po.DeliveryStatus === "Head Post Office");

     if (!mainOffice) {
      mainOffice = data.PostOffice.find(po => po.DeliveryStatus === "Sub Post Office") || data.PostOffice[0];
    }

    const { Name: Area, District, State } = mainOffice;
    const isAvailable = serviceablePincodes.includes(pincode);

    if (isAvailable) {
      return res.json({
        success: true,
        message: `✅ Delivery available in ${Area}, ${District}, ${State}.`,
        area: Area,
        district: District,
        state: State,
      });
    } else {
      return res.json({
        success: false,
        message: `❌ Sorry, delivery not available in ${Area}  ${District}, ${State}.`,
        area: Area,
        district: District,
        state: State,
      });
    }
  } catch (err) {
    console.error("Pincode check error:", err.message);
    return res.json({ success: false, message: "⚠️ Server error. Please try again later." });
  }
});
module.exports = router;
