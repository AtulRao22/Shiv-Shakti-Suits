const express = require("express");
const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware");
const Order = require("../models/Order");
const router = express.Router();

//Mark order as paid
router.put("/:id/pay", isAuthenticated, async (req, res)=> {
    try{
        const order = await Order.findById(req.params.id);

        if(order) {
            order.status = "Paid";

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        }else {
            res.status(404).json({message: "Order not found"});
        }
    }catch (error) {
        res.status(500).json({message: error.message});
    }
});


// mark order as delivered only by admin
router.put("/:id/deliver", isAuthenticated, isAdmin, async (req, res) => {
    try{
        const order = await Order.findById(req.params.id);

        if(order) {
            order.status = "Delivered";

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        }else{
            res.status(404).json({message: "Order not found"});
        }
    }catch (error) {
        res.status(500).json({message: error.message});
    }
});

module.exports = router;
