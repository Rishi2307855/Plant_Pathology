const express = require("express");
const router = express.Router();
const {
  registerUser,
  registerFarmer,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword
} = require("../controllers/authcontroller");
const protect = require("../middleware/authMiddleware");

// Registration
router.post("/register", registerUser);
router.post("/register-farmer", registerFarmer);
// Password recovery
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Login
router.post("/login", loginUser);

// Get logged-in user
router.get("/me", protect, getMe);

module.exports = router;