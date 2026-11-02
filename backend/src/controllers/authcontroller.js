const User = require("../models/User");
const Farmer = require("../models/Farmer");
const bcrypt = require("bcryptjs");

// User Registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "user"
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    res.status(500).json({
      message: "Registration failed"
    });
  }
};

// Farmer Registration
const registerFarmer = async (req, res) => {
  let createdUser;

  try {
    const {
      name,
      email,
      password,
      phone,
      farmName,
      location,
      experience,
      bio
    } = req.body;

    if (!name || !email || !password || !phone || !location) {
      return res.status(400).json({
        message: "Name, email, password, phone and location are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create farmer account
    createdUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "farmer"
    });

    // Create separate farmer profile
    const farmer = await Farmer.create({
      userId: createdUser._id,
      phone,
      farmName,
      location,
      experience,
      bio
    });

    res.status(201).json({
      message: "Farmer registered successfully",
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role
      },
      farmer: {
        id: farmer._id,
        phone: farmer.phone,
        farmName: farmer.farmName,
        location: farmer.location
      }
    });

  } catch (error) {
    // Remove the account if farmer profile creation fails
    if (createdUser) {
      try {
        await User.deleteOne({ _id: createdUser._id });
      } catch (cleanupError) {
        console.error("Account cleanup failed:", cleanupError.message);
      }
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    res.status(500).json({
      message: "Farmer registration failed"
    });
  }
};

// User, Farmer and Admin Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find account and include hidden password field
    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account is deactivated"
      });
    }

    // Compare entered password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Generate JWT token
    const token = require("jsonwebtoken").sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Login failed"
    });
  }
};

// Get Logged-in User
const getMe = async (req, res) => {
  try {
    res.status(200).json({
      message: "User authenticated successfully",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isActive: req.user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve user"
    });
  }
};
module.exports = {
  registerUser,
  registerFarmer,
  loginUser,
  getMe
};