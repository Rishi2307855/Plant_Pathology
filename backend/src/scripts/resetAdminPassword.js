require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/User");

const resetAdminPassword = async () => {
  try {
    const newPassword = process.env.ADMIN_NEW_PASSWORD;

    if (!newPassword || newPassword.length < 12) {
      throw new Error("New password must contain at least 12 characters");
    }

    await connectDB();

    const admin = await User.findOne({
      email: "admin.plantpathology@example.com",
      role: "admin"
    });

    if (!admin) {
      throw new Error("Admin account not found");
    }

    admin.password = await bcrypt.hash(newPassword, 12);
    await admin.save();

    console.log("Admin password reset successfully!");

  } finally {
    await mongoose.disconnect();
  }
};

resetAdminPassword().catch((error) => {
  console.error("Password reset failed:", error.message);
  process.exitCode = 1;
});