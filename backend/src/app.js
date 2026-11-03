const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const plantRoutes = require("./routes/plantRoutes");
const diseaseRoutes = require("./routes/diseaseRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Plant Pathology API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/plants", plantRoutes);
app.use("/api/diseases", diseaseRoutes);

module.exports = app;