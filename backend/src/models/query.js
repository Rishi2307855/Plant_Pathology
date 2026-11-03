const mongoose = require("mongoose");

const querySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      default: null
    },

    question: {
      type: String,
      required: true,
      trim: true
    },

    response: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["pending", "answered", "closed"],
      default: "pending"
    },

    respondedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Query = mongoose.model("Query", querySchema);

module.exports = Query;