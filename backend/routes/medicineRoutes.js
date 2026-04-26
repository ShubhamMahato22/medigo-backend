
const express = require("express");
const router = express.Router();

const {
  getAllMedicines,
  getMedicineById,
  addMedicine,
  deleteMedicine,
  updateMedicine,
} = require("../controllers/medicineController");


router.get("/", getAllMedicines);

router.get("/:id", getMedicineById);

router.post("/", addMedicine);

router.delete("/:id", deleteMedicine);

// PUT  /api/medicines/:id  → Update a medicine (Admin)
router.put("/:id", updateMedicine);

module.exports = router;
