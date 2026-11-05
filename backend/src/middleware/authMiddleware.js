const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
  try {
    // Get token from request header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided."
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find user in database
    const user = await User.findById(decoded.id)
      .select("_id name email role isActive");

    if (!user) {
      return res.status(401).json({
        message: "User account not found"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account is deactivated"
      });
    }

    // Attach user details to request
    req.user = user;

    next();

  } catch (error) {
    console.error("JWT ERROR:", error.name, error.message);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token"
      });
    }

    console.error("Authentication error:", error.message);

    res.status(500).json({
      message: "Authentication failed"
    });
  }
};

module.exports = protect;