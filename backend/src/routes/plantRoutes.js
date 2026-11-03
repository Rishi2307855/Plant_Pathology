const express = require("express");
const router = express.Router();

const {
  createPlant,
  getPlants,
  getPlantById,
  updatePlant,
  deletePlant
} = require("../controllers/plantController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// View all plants – authenticated users
router.get("/", protect, authorizeRoles("user", "farmer", "admin"), getPlants);

// View one plant
router.get("/:id", protect, authorizeRoles("user", "farmer", "admin"), getPlantById);

// Add plant – Farmer only
router.post("/", protect, authorizeRoles("farmer"), createPlant);

// Update plant – Farmer only
router.patch("/:id", protect, authorizeRoles("farmer"), updatePlant);

// Delete plant – Farmer only
router.delete("/:id", protect, authorizeRoles("farmer"), deletePlant);

module.exports = router;