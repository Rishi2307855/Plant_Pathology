const express = require("express");
const router = express.Router();

const { uploadImage } = require("../controllers/uploadController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Handle Multer errors
const handleImageUpload = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    next();
  });
};

// Upload image – User and Farmer
router.post(
  "/image",
  protect,
  authorizeRoles("user", "farmer"),
  handleImageUpload,
  uploadImage
);

module.exports = router;