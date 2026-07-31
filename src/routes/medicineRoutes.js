const express = require("express");

const router = express.Router();

const {
  addMedicine,
  updateStock,
  getMedicines,
  getLowStockMedicines,
} = require("../controllers/medicineController");

// API 1 - Add Medicine
router.post("/", addMedicine);

// API 2 - Get Medicine List
router.get("/", getMedicines);

// API 3 - Update Stock
router.put("/stock", updateStock);

// API 6 - Low Stock Alert
router.get("/low-stock", getLowStockMedicines);

module.exports = router;