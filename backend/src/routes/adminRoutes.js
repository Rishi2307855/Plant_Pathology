
const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  updateUserStatus,
} = require("../controllers/AdminController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Only admins can view all registered users
router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  getAllUsers
);

// Only admins can activate or deactivate accounts
router.patch(
  "/users/:id/status",
  protect,
  authorizeRoles("admin"),
  updateUserStatus
);

module.exports = router;
