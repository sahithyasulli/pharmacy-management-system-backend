require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");
const { connectRedis } = require("./src/config/redis");

const medicineRoutes = require("./src/routes/medicineRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const aiRoutes = require("./src/routes/aiRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();
connectRedis();

// Routes
app.use("/api/medicines", medicineRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ai", aiRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Pharmacy Backend Running");
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});