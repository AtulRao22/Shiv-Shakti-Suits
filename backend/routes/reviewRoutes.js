const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// Submit or update a review
router.post("/products/:productId", reviewController.submitReview);

// Get all reviews for a product
router.get("/products/:productId", reviewController.getProductReviews);

// Get rating summary for a product
router.get("/products/:productId/summary", reviewController.getRatingSummary);

// Delete a review
router.delete("/:reviewId", reviewController.deleteReview);

module.exports = router;
