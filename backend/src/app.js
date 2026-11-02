const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.json({
    message: "Plant Pathology API is running"
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

module.exports = app;