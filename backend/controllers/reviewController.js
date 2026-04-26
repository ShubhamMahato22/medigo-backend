const Review = require("../models/Review");
const Medicine = require("../models/Medicine");

// @desc    Create a review for a medicine
// @route   POST /api/reviews/:medicineId
exports.addReview = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { userId, name, comment, rating } = req.body;

    if (!userId || !name || !comment || !rating) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (userId, name, comment, rating)",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Optional: Check if user already reviewed
    const existingReview = await Review.findOne({ user: userId, medicine: medicineId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this medicine",
      });
    }

    // 1. Create the new review
    const newReview = await Review.create({
      user: userId,
      medicine: medicineId,
      name,
      comment,
      rating,
    });

    // 2. Recalculate stats for this medicine
    const allReviews = await Review.find({ medicine: medicineId });
    const totalReviews = allReviews.length;
    const avgRating =
      allReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews;

    // 3. Update Medicine model
    await Medicine.findByIdAndUpdate(medicineId, {
      avgRating: avgRating.toFixed(1),
      totalReviews,
    });

    return res.status(201).json({
      success: true,
      data: newReview,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
};

// @desc    Get all reviews for a specific medicine
// @route   GET /api/reviews/:medicineId
exports.getReviews = async (req, res) => {
  try {
    const { medicineId } = req.params;

    const reviews = await Review.find({ medicine: medicineId }).sort({
      createdAt: -1, // newest first
    });

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
};
