const Order = require("../models/Order");
const Medicine = require("../models/Medicine");
const { redisClient } = require("../config/redis");

// ==============================
// Place Order API
// ==============================

const placeOrder = async (req, res) => {
  try {
    const { user_id, medicine_list } = req.body;

    if (!user_id || !medicine_list || medicine_list.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User ID and medicine list are required",
      });
    }

    let medicines = [];
    let totalAmount = 0;

    for (const item of medicine_list) {
      const medicine = await Medicine.findById(item.medicine_id);

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: "Medicine not found",
        });
      }

      if (medicine.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${medicine.name} is out of stock`,
        });
      }

      // Deduct stock
      medicine.stock -= item.quantity;
      await medicine.save();

      medicines.push({
        medicine: medicine._id,
        quantity: item.quantity,
        price: medicine.price,
      });

      totalAmount += medicine.price * item.quantity;
    }

    // Clear Redis Cache
    await redisClient.del("medicineList");

    // Create Order
    const order = await Order.create({
      user_id,
      medicines,
      totalAmount,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get Order Details API
// ==============================

const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("medicines.medicine");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  placeOrder,
  getOrderDetails,
};