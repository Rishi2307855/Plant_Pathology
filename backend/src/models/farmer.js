const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    phone: {
      type: String,
      required: true
    },

    farmName: {
      type: String,
      trim: true
    },

    location: {
      type: String,
      required: true
    },

    experience: {
      type: Number,
      min: 0,
      default: 0
    },

    bio: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Farmer = mongoose.model("Farmer", farmerSchema);

module.exports = Farmer;