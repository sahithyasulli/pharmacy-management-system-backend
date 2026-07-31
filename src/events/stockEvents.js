const EventEmitter = require("events");

const stockEmitter = new EventEmitter();

// Low Stock Event
stockEmitter.on("lowStock", (medicine) => {
  console.log("=================================");
  console.log("🚨 LOW STOCK ALERT");
  console.log(`Medicine: ${medicine.name}`);
  console.log(`Current Stock: ${medicine.stock}`);
  console.log(`Threshold: ${medicine.threshold}`);
  console.log("=================================");
});

module.exports = stockEmitter;