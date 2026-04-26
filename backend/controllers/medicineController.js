const Medicine = require("../models/Medicine");
const getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find();

    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

const addMedicine = async (req, res) => {
  try {
    const data = req.body;

    // 🔥 If array comes → insert many
    if (Array.isArray(data)) {
      const medicines = await Medicine.insertMany(data);
      return res.status(201).json({
        success: true,
        message: "Multiple medicines added successfully",
        data: medicines,
      });
    }

    const {
      name,
      description,
      price,
      stock,
      category,
      manufacturer,
      imageUrl,
    } = data;

    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }
    const finalImageUrl = imageUrl && imageUrl.trim() !== ""
  ? imageUrl
  : "assets/images/medicines/default.jpg";

    const newMedicine = await Medicine.create({
      name,
      description,
      price,
      stock,
      category,
      manufacturer,
      imageUrl: finalImageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      data: newMedicine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Medicine deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

const updateMedicine = async (req, res) => {
  try {
    const updates = req.body;

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      data: medicine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

module.exports = {
  getAllMedicines,
  getMedicineById,
  addMedicine,
  deleteMedicine,
  updateMedicine,
};
