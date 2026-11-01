const mongoose = require("mongoose");

const diseaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    plantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
      required: true
    },

    description: {
      type: String,
      required: true
    },

    symptoms: {
      type: [String],
      default: []
    },

    causes: {
      type: [String],
      default: []
    },

    treatment: {
      type: String,
      required: true
    },

    prevention: {
      type: String,
      default: ""
    },

    image: {
      type: String,
      default: ""
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Disease = mongoose.model("Disease", diseaseSchema);

module.exports = Disease;