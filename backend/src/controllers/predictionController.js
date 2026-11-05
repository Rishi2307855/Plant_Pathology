
const Prediction = require("../models/prediction");
const Plant = require("../models/plant");
const Disease = require("../models/disease");

// Convert ML class name into readable disease name
const formatDiseaseName = (name) => {
  return name
    .replace(/^Tomato___/, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b[a-z]/g, (char) => char.toUpperCase())
    .trim();
};

// Create ML Prediction
const createPrediction = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    // 1. Validate image URL
    if (!imageUrl) {
      return res.status(400).json({
        message: "Image URL is required"
      });
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(imageUrl);
    } catch {
      return res.status(400).json({
        message: "Invalid image URL"
      });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (
      parsedUrl.protocol !== "https:" ||
      parsedUrl.hostname !== "res.cloudinary.com" ||
      (cloudName && !parsedUrl.pathname.startsWith(`/${cloudName}/`))
    ) {
      return res.status(400).json({
        message: "Please provide a valid Cloudinary image URL"
      });
    }

    // 2. Send image URL to Python ML API
    const mlApiUrl =
      process.env.ML_API_URL ||
      "http://127.0.0.1:8000/predict";

    const mlResponse = await fetch(mlApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image_url: imageUrl
      }),
      signal: AbortSignal.timeout(30000)
    });

    const mlResult = await mlResponse.json();

    if (!mlResponse.ok) {
      return res.status(502).json({
        message: "ML prediction service failed",
        details: mlResult.detail || mlResult.message
      });
    }

    // 3. Extract prediction results
    const {
      predicted_disease,
      confidence,
      model_version,
      top_predictions
    } = mlResult;

    if (
      typeof predicted_disease !== "string" ||
      !predicted_disease.startsWith("Tomato___") ||
      !Number.isFinite(confidence) ||
      confidence < 0 ||
      confidence > 100
    ) {
      return res.status(502).json({
        message: "Invalid prediction response from ML service"
      });
    }

    const diseaseName = formatDiseaseName(predicted_disease);

    // 4. Find Tomato plant in MongoDB
    const plant = await Plant.findOne({
      name: /^Tomato$/i
    });

    let diseaseId = null;
    let plantId = plant ? plant._id : null;

    // 5. Find matching Disease record if available
    if (plant) {
      const diseases = await Disease.find({
        plantId: plant._id
      }).select("_id name");

      const normalize = (value) =>
        value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

      const matchingDisease = diseases.find(
        disease =>
          normalize(disease.name) === normalize(diseaseName)
      );

      if (matchingDisease) {
        diseaseId = matchingDisease._id;
      }
    }

    // 6. Save prediction in MongoDB
    const prediction = await Prediction.create({
      userId: req.user._id,
      imageUrl,
      plantId,
      diseaseId,
      predictedDisease: diseaseName,
      confidence,
      modelVersion: model_version || "2.0"
    });

    // 7. Return prediction details
    res.status(201).json({
      message: "Prediction created successfully",

      prediction,

      topPredictions: top_predictions
    });

  } catch (error) {
    console.error("Prediction error:", error);

    if (error.name === "TimeoutError" ||
        error.name === "AbortError") {
      return res.status(504).json({
        message: "ML prediction service timed out"
      });
    }

    if (error.name === "TypeError") {
      return res.status(502).json({
        message: "Unable to connect to ML prediction service"
      });
    }

    res.status(500).json({
      message: "Failed to create prediction"
    });
  }
};

// Get prediction history – Logged-in User or Farmer
const getMyPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find({
      userId: req.user._id
    })
      .populate("plantId", "name scientificName")
      .populate(
        "diseaseId",
        "name description symptoms treatment prevention"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: predictions.length,
      predictions
    });

  } catch (error) {
    console.error("Get predictions error:", error.message);

    res.status(500).json({
      message: "Failed to retrieve prediction history"
    });
  }
};

module.exports = {
  createPrediction,
  getMyPredictions
};
