const express = require("express");
const router = express.Router();

const {
  createQuery,
  getAvailableQueries,
  respondToQuery,
  getMyQueries,
  closeQuery
} = require("../controllers/queryController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// User submits a question
router.post(
  "/",
  protect,
  authorizeRoles("user"),
  createQuery
);

// User views their own questions
router.get(
  "/my",
  protect,
  authorizeRoles("user"),
  getMyQueries
);

// Farmer views available questions
router.get(
  "/available",
  protect,
  authorizeRoles("farmer"),
  getAvailableQueries
);

// Farmer answers a question
router.patch(
  "/:id/respond",
  protect,
  authorizeRoles("farmer"),
  respondToQuery
);
// User closes completed query
router.patch(
  "/:id/close",
  protect,
  authorizeRoles("user"),
  closeQuery
);

module.exports = router;