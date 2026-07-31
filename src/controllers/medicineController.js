const Medicine = require("../models/Medicine");
const stockEmitter = require("../events/stockEvents");
const { redisClient } = require("../config/redis");

// ==============================
// API 1 - Add Medicine
// ==============================
const addMedicine = async (req, res) => {
  try {
    const { name, category, stock, price } = req.body;

    if (!name || !category || stock === undefined || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingMedicine = await Medicine.findOne({ name });

    if (existingMedicine) {
      return res.status(400).json({
        success: false,
        message: "Medicine already exists",
      });
    }

    const medicine = await Medicine.create({
      name,
      category,
      stock,
      price,
    });

    // Clear Redis cache
    await redisClient.del("medicineList");

    res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      medicine,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// API 2 - Update Stock
// ==============================
const updateStock = async (req, res) => {
  try {
    const { medicine_id, quantity } = req.body;

    if (!medicine_id || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID and quantity are required",
      });
    }

    const medicine = await Medicine.findById(medicine_id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    medicine.stock += quantity;

    if (medicine.stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    await medicine.save();

    // Clear Redis cache
    await redisClient.del("medicineList");

    // Trigger Event
    if (medicine.stock <= medicine.threshold) {
      stockEmitter.emit("lowStock", medicine);
    }

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      medicine,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// API 3 - Get Medicine List
// ==============================
const getMedicines = async (req, res) => {
  try {

    const cachedData = await redisClient.get("medicineList");

    if (cachedData) {
      return res.status(200).json({
        success: true,
        source: "Redis Cache",
        medicines: JSON.parse(cachedData),
      });
    }

    const medicines = await Medicine.find();

    await redisClient.setEx(
      "medicineList",
      60,
      JSON.stringify(medicines)
    );

    res.status(200).json({
      success: true,
      source: "MongoDB",
      medicines,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// API 6 - Low Stock Alert
// ==============================
const getLowStockMedicines = async (req, res) => {
  try {

    const medicines = await Medicine.find({
      $expr: {
        $lte: ["$stock", "$threshold"],
      },
    });

    res.status(200).json({
      success: true,
      count: medicines.length,
      medicines,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addMedicine,
  updateStock,
  getMedicines,
  getLowStockMedicines,
};