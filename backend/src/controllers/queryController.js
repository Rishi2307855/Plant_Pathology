const mongoose = require("mongoose");
const Query = require("../models/query");
const Farmer = require("../models/farmer");

// 1. Create Query – User
const createQuery = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "Question is required"
      });
    }

    const query = await Query.create({
      userId: req.user._id,
      question: question.trim(),
      status: "pending"
    });

    res.status(201).json({
      message: "Query submitted successfully",
      query
    });

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Failed to submit query"
    });
  }
};

// 2. Get Pending Queries – Farmer
const getAvailableQueries = async (req, res) => {
  try {
    const queries = await Query.find({
      status: "pending",
      $or: [
        { farmerId: null },
        { farmerId: { $exists: false } }
      ]
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: queries.length,
      queries
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve queries"
    });
  }
};

// 3. Respond to Query – Farmer
const respondToQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid query ID"
      });
    }

    if (!response || !response.trim()) {
      return res.status(400).json({
        message: "Response is required"
      });
    }

    // Find the farmer profile linked to this user
    const farmer = await Farmer.findOne({
      userId: req.user._id
    });

    if (!farmer) {
      return res.status(404).json({
        message: "Farmer profile not found"
      });
    }

    // Atomically answer only an unassigned pending query
    const query = await Query.findOneAndUpdate(
      {
        _id: id,
        status: "pending",
        $or: [
          { farmerId: null },
          { farmerId: { $exists: false } }
        ]
      },
      {
        $set: {
          farmerId: farmer._id,
          response: response.trim(),
          status: "answered",
          respondedAt: new Date()
        }
      },
      {
        new: true,
        runValidators: true
      }
    ).populate("userId", "name email")
     .populate("farmerId", "farmName");

    if (!query) {
      const existingQuery = await Query.findById(id);

      if (!existingQuery) {
        return res.status(404).json({
          message: "Query not found"
        });
      }

      return res.status(409).json({
        message: "Query is already answered or assigned"
      });
    }

    res.status(200).json({
      message: "Response submitted successfully",
      query
    });

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Failed to respond to query"
    });
  }
};

// 4. Get My Queries – User
const getMyQueries = async (req, res) => {
  try {
    const queries = await Query.find({
      userId: req.user._id
    })
      .populate("farmerId", "farmName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: queries.length,
      queries
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve your queries"
    });
  }
};
// 5. Close Query – User
const closeQuery = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid query ID"
      });
    }

    const query = await Query.findOneAndUpdate(
      {
        _id: id,
        userId: req.user._id,
        status: "answered"
      },
      {
        $set: {
          status: "closed"
        }
      },
      {
        new: true
      }
    );

    if (!query) {
      return res.status(404).json({
        message: "Answered query not found or you are not its owner"
      });
    }

    res.status(200).json({
      message: "Query closed successfully",
      query
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to close query"
    });
  }
};
module.exports = {
  createQuery,
  getAvailableQueries,
  respondToQuery,
  getMyQueries,
  closeQuery
};