
const express = require("express");
const router = express.Router();

const {
  createPrediction,
  getMyPredictions
} = require("../controllers/predictionController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// View personal prediction history
router.get(
  "/my",
  protect,
  authorizeRoles("user", "farmer"),
  getMyPredictions
);

// Create a new prediction
router.post(
  "/",
  protect,
  authorizeRoles("user", "farmer"),
  createPrediction
);

module.exports = router;
