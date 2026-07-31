const express = require("express");

const router = express.Router();

const {
  placeOrder,
  getOrderDetails,
} = require("../controllers/orderController");

// API 4 - Place Order
router.post("/", placeOrder);

// API 5 - Get Order Details
router.get("/:orderId", getOrderDetails);

module.exports = router;