const mongoose = require("mongoose");
const Disease = require("../models/disease");
const Plant = require("../models/plant");

// 1. Add Disease
const createDisease = async (req, res) => {
  try {
    const {
      name,
      plantId,
      description,
      symptoms,
      causes,
      treatment,
      prevention,
      image
    } = req.body;

    if (!name || !plantId || !description || !treatment) {
      return res.status(400).json({
        message: "Name, plantId, description and treatment are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(plantId)) {
      return res.status(400).json({
        message: "Invalid plant ID"
      });
    }

    // Check whether the plant belongs to this farmer
    const plant = await Plant.findOne({
      _id: plantId,
      createdBy: req.user._id
    });

    if (!plant) {
      return res.status(404).json({
        message: "Plant not found or you are not its owner"
      });
    }

    const disease = await Disease.create({
      name,
      plantId,
      description,
      symptoms,
      causes,
      treatment,
      prevention,
      image,
      createdBy: req.user._id
    });

    res.status(201).json({
      message: "Disease added successfully",
      disease
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: "Failed to add disease"
    });
  }
};

// 2. Get All Diseases
const getDiseases = async (req, res) => {
  try {
    const diseases = await Disease.find()
      .populate("plantId", "name scientificName")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: diseases.length,
      diseases
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve diseases"
    });
  }
};

// 3. Get Disease By ID
const getDiseaseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid disease ID"
      });
    }

    const disease = await Disease.findById(id)
      .populate("plantId", "name scientificName")
      .populate("createdBy", "name");

    if (!disease) {
      return res.status(404).json({
        message: "Disease not found"
      });
    }

    res.status(200).json({ disease });

  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve disease"
    });
  }
};

// 4. Update Disease
const updateDisease = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid disease ID"
      });
    }

    const allowedFields = [
      "name",
      "description",
      "symptoms",
      "causes",
      "treatment",
      "prevention",
      "image"
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update"
      });
    }

    const disease = await Disease.findOneAndUpdate(
      {
        _id: id,
        createdBy: req.user._id
      },
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!disease) {
      return res.status(404).json({
        message: "Disease not found or you are not its owner"
      });
    }

    res.status(200).json({
      message: "Disease updated successfully",
      disease
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update disease"
    });
  }
};

// 5. Delete Disease
const deleteDisease = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid disease ID"
      });
    }

    const disease = await Disease.findOneAndDelete({
      _id: id,
      createdBy: req.user._id
    });

    if (!disease) {
      return res.status(404).json({
        message: "Disease not found or you are not its owner"
      });
    }

    res.status(200).json({
      message: "Disease deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete disease"
    });
  }
};

module.exports = {
  createDisease,
  getDiseases,
  getDiseaseById,
  updateDisease,
  deleteDisease
};