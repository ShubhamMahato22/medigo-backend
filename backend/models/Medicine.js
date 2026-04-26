
const mongoose = require("mongoose");
const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },

    manufacturer: {
      type: String,
    },

    imageUrl: {
      type: String,
      default: "images/default-medicine.png",
    },

    requiresPrescription: {
      type: Boolean,
      default: false,
    },

    avgRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Medicine", medicineSchema);
