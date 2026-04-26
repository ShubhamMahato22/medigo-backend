const express = require("express");
const router = express.Router();
const {
  addReview,
  getReviews,
} = require("../controllers/reviewController");

router.post("/:medicineId", addReview);
router.get("/:medicineId", getReviews);

module.exports = router;
