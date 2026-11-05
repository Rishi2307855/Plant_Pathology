const mongoose = require("mongoose");
const Plant = require("../models/plant");

// 1. Add Plant
const createPlant = async (req, res) => {
  try {
    const {
      name,
      scientificName,
      description,
      image,
      category
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        message: "Plant name and description are required"
      });
    }

    const plant = await Plant.create({
      name,
      scientificName,
      description,
      image,
      category,
      createdBy: req.user._id
    });

    res.status(201).json({
      message: "Plant added successfully",
      plant
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to add plant"
    });
  }
};

// 2. Get All Plants
const getPlants = async (req, res) => {
  try {
    const plants = await Plant.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: plants.length,
      plants
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve plants"
    });
  }
};

// 3. Get Plant By ID
const getPlantById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid plant ID"
      });
    }

    const plant = await Plant.findById(id)
      .populate("createdBy", "name");

    if (!plant) {
      return res.status(404).json({
        message: "Plant not found"
      });
    }

    res.status(200).json({ plant });

  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve plant"
    });
  }
};

// 4. Update Plant
const updatePlant = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid plant ID"
      });
    }

    const allowedFields = [
      "name",
      "scientificName",
      "description",
      "image",
      "category"
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

    const plant = await Plant.findOneAndUpdate(
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

    if (!plant) {
      return res.status(404).json({
        message: "Plant not found or you are not its owner"
      });
    }

    res.status(200).json({
      message: "Plant updated successfully",
      plant
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update plant"
    });
  }
};

// 5. Delete Plant
const deletePlant = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid plant ID"
      });
    }

    const plant = await Plant.findOneAndDelete({
      _id: id,
      createdBy: req.user._id
    });

    if (!plant) {
      return res.status(404).json({
        message: "Plant not found or you are not its owner"
      });
    }

    res.status(200).json({
      message: "Plant deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete plant"
    });
  }
};

module.exports = {
  createPlant,
  getPlants,
  getPlantById,
  updatePlant,
  deletePlant
};