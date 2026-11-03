
import { useEffect, useState } from "react";
import api from "../services/api";

function formatDiseaseName(name = "") {
  return name
    .replace(/^Tomato___/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function Prediction() {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!imageFile) {
      setPreview("");
      return;
    }

    const imageUrl = URL.createObjectURL(imageFile);
    setPreview(imageUrl);

    return () => URL.revokeObjectURL(imageUrl);
  }, [imageFile]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    setError("");
    setResult(null);

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please select a JPG, PNG or WEBP image.");
      setImageFile(null);
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("Image size must be smaller than 8 MB.");
      setImageFile(null);
      return;
    }

    setImageFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!imageFile) {
      setError("Please select a Tomato leaf image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Step 1: Upload image to Cloudinary through Express
      const formData = new FormData();
      formData.append("image", imageFile);

      const uploadResponse = await api.post(
        "/uploads/image",
        formData
      );

      const imageUrl =
        uploadResponse.data?.image?.url ||
        uploadResponse.data?.url;

      if (!imageUrl) {
        throw new Error("Image upload response did not contain a URL.");
      }

      // Step 2: Send image URL to the ML prediction API through Express
      const predictionResponse = await api.post(
        "/predictions",
        { imageUrl }
      );

      // Step 3: Display saved prediction
      setResult(predictionResponse.data);

    } catch (err) {
      setError(
        err.response?.data?.details ||
        err.response?.data?.message ||
        err.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const prediction = result?.prediction;
  const topPredictions = result?.topPredictions || [];

  return (
    <main className="prediction-page">
      <div className="prediction-container">

        <div className="prediction-heading">
          <span className="eyebrow">AI-POWERED PLANT HEALTH</span>
          <h1>Tomato Disease Detection</h1>
          <p>
            Upload a Tomato leaf photograph to identify
            possible diseases using our trained ML model.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="upload-card">

          <label htmlFor="leaf-image" className="upload-area">
            <span className="upload-icon">🌿</span>
            <h3>Choose a Tomato Leaf Image</h3>
            <p>JPG, PNG or WEBP · Maximum 8 MB</p>

            <span className="choose-file">
              Browse Image
            </span>

            <input
              id="leaf-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              hidden
            />
          </label>

          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Selected Tomato leaf" />
              <p>{imageFile?.name}</p>

              <button
                type="button"
                className="remove-image"
                onClick={() => {
                  setImageFile(null);
                  setResult(null);
                  setError("");
                }}
              >
                Remove Image
              </button>
            </div>
          )}

          {error && (
            <div className="prediction-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="predict-button"
            disabled={loading || !imageFile}
          >
            {loading ? "Analysing Leaf..." : "Detect Disease"}
          </button>

        </form>

        {result && prediction && (
          <section className="result-card">
            <span className="eyebrow">ANALYSIS COMPLETE</span>
            <h2>Prediction Result</h2>

            <div className="result-main">
              <p>Predicted Disease</p>
              <h3>
                {formatDiseaseName(prediction.predictedDisease)}
              </h3>

              <div className="confidence-value">
                {Number(prediction.confidence).toFixed(2)}%
              </div>
              <p>Model confidence</p>
            </div>

            <h3 className="top-title">Top Predictions</h3>

            {topPredictions.map((item, index) => (
              <div className="top-prediction" key={index}>
                <span>{formatDiseaseName(item.disease)}</span>
                <strong>{Number(item.confidence).toFixed(2)}%</strong>
              </div>
            ))}

            <p className="model-version">
              Model version: {prediction.modelVersion}
            </p>

            <p className="prediction-disclaimer">
              AI-generated result for informational purposes.
              Confirm suspected diseases with a qualified
              agricultural expert before treatment.
            </p>
          </section>
        )}

      </div>
    </main>
  );
}

export default Prediction;
