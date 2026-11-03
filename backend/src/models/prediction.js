const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    imageUrl: {
      type: String,
      required: true
    },

    plantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
      default: null
    },

    diseaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Disease",
      default: null
    },

    predictedDisease: {
      type: String,
      required: true
    },

    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    modelVersion: {
      type: String,
      default: "1.0"
    }
  },
  {
    timestamps: true
  }
);

const Prediction = mongoose.model("Prediction", predictionSchema);

module.exports = Prediction;