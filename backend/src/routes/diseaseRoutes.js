const express = require("express");
const router = express.Router();

const {
  createDisease,
  getDiseases,
  getDiseaseById,
  updateDisease,
  deleteDisease
} = require("../controllers/diseaseController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// View all diseases
router.get(
  "/",
  protect,
  authorizeRoles("user", "farmer", "admin"),
  getDiseases
);

// View disease by ID
router.get(
  "/:id",
  protect,
  authorizeRoles("user", "farmer", "admin"),
  getDiseaseById
);

// Add disease – Farmer only
router.post(
  "/",
  protect,
  authorizeRoles("farmer"),
  createDisease
);

// Update disease – Farmer only
router.patch(
  "/:id",
  protect,
  authorizeRoles("farmer"),
  updateDisease
);

// Delete disease – Farmer only
router.delete(
  "/:id",
  protect,
  authorizeRoles("farmer"),
  deleteDisease
);

module.exports = router;