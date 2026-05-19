const express = require("express");
const {
    addOrderItems,
    getOrderById,
    getMyOrders,
} = require("../controllers/orderController");

const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware");
const router = express.Router();

//Mark oder as paid
router.put("/:id/pay", isAuthenticated, async (req, res)=> {
    try{
        const order = await Order.findById(req.params.id);

        if(order) {
            order.isPaid = true;
            order.paidAt = Date.now();

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
            order.isDelivered = true;
            order.isDelivered = Date.now();

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
