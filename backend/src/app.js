const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const plantRoutes = require("./routes/plantRoutes");
const diseaseRoutes = require("./routes/diseaseRoutes");
const queryRoutes = require("./routes/queryRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Plant Pathology API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/plants", plantRoutes);
app.use("/api/diseases", diseaseRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/predictions", predictionRoutes);
module.exports = app;