const express = require("express");

const router = express.Router();

const { recommendMedicine } = require("../ai/aiController");

router.post("/recommend", recommendMedicine);

module.exports = router;