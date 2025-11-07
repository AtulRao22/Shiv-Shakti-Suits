const Review = require("../models/Review");
const Product = require("../models/Product");

// Submit or update a review
exports.submitReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.session.user?._id || req.body.user;

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: "Rating must be between 1 and 5" 
      });
    }

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Please login to submit a review" 
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Check if user already reviewed this product
    let review = await Review.findOne({ product: productId, user: userId });
    
    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment || review.comment;
      await review.save();
    } else {
      // Create new review
      review = await Review.create({ 
        product: productId, 
        user:  userId, 
        rating, 
        comment 
      });
    }

    // Recalculate product average rating
    await updateProductRating(productId);

    res.json({ 
      success: true, 
      message: "Review submitted successfully",
      review 
    });
  } catch (err) {
    console.error("Error submitting review:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error submitting review" 
    });
  }
};

// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email"); // If using User model reference

      
console.log("Reviews fetched:", JSON.stringify(reviews, null, 2));

    const total = await Review.countDocuments({ product: productId });

    res.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching reviews" 
    });
  }
};

// Get rating summary for a product
exports.getRatingSummary = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId });
    
    if (reviews.length === 0) {
      return res.json({
        success: true,
        summary: {
          averageRating: 0,
          totalReviews: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }
      });
    }

    // Calculate distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    reviews.forEach(review => {
      distribution[review.rating]++;
      totalRating += review.rating;
    });

    const averageRating = (totalRating / reviews.length).toFixed(1);

    res.json({
      success: true,
      summary: {
        averageRating: parseFloat(averageRating),
        totalReviews: reviews.length,
        distribution
      }
    });
  } catch (err) {
    console.error("Error fetching rating summary:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching rating summary" 
    });
  }
};

// Delete a review (for admin or user who created it)
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.session.user?._id;

    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: "Review not found" 
      });
    }

    // Check if user is authorized to delete
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to delete this review" 
      });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(reviewId);

    // Recalculate product rating
    await updateProductRating(productId);

    res.json({ 
      success: true, 
      message: "Review deleted successfully" 
    });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting review" 
    });
  }
};

// Helper function to update product rating
async function updateProductRating(productId) {
  const reviews = await Review.find({ product: productId });
  
  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      totalRatings: 0
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = (totalRating / reviews.length).toFixed(1);

  await Product.findByIdAndUpdate(productId, {
    averageRating: parseFloat(averageRating),
    totalRatings: reviews.length
  });
}
