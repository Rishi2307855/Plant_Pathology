
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function formatDiseaseName(name = "") {
  return name
    .replace(/^Tomato___/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function PredictionHistory() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/predictions/my");

      setPredictions(response.data.predictions || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load prediction history."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <main className="history-page">
      <div className="history-container">

        <div className="history-header">
          <div>
            <span className="eyebrow">YOUR ACTIVITY</span>
            <h1>Prediction History</h1>
            <p>View your previously analysed Tomato leaf images.</p>
          </div>

          <Link to="/predict" className="history-button">
            New Prediction
          </Link>
        </div>

        <div className="history-summary">
          <h3>{predictions.length}</h3>
          <p>Total Predictions</p>
        </div>

        {loading && (
          <div className="history-message">
            Loading prediction history...
          </div>
        )}

        {error && !loading && (
          <div className="history-error">
            <p>{error}</p>
            <button onClick={fetchHistory}>
              Try Again
            </button>
            <p>
              <Link to="/login">Go to Login</Link>
            </p>
          </div>
        )}

        {!loading && !error && predictions.length === 0 && (
          <div className="empty-history">
            <span>🌿</span>
            <h3>No Predictions Yet</h3>
            <p>
              You haven't analysed any Tomato leaf images.
              Start by uploading your first image.
            </p>
            <Link to="/predict" className="history-button">
              Detect Disease
            </Link>
          </div>
        )}

        {!loading && !error && predictions.length > 0 && (
          <div className="history-grid">
            {predictions.map((item) => (
              <article className="history-card" key={item._id}>
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt="Analysed Tomato leaf"
                  />
                )}

                <div className="history-card-content">
                  <span className="history-label">
                    Predicted Disease
                  </span>

                  <h3>
                    {formatDiseaseName(item.predictedDisease)}
                  </h3>

                  <div className="history-confidence">
                    <span>Confidence</span>
                    <strong>
                      {Number(item.confidence).toFixed(2)}%
                    </strong>
                  </div>

                  <p>
                    <strong>Plant:</strong>{" "}
                    {item.plantId?.name || "Tomato"}
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "Date unavailable"}
                  </p>

                  <p>
                    <strong>Model:</strong>{" "}
                    {item.modelVersion || "N/A"}
                  </p>

                  {item.diseaseId?.description && (
                    <p className="history-description">
                      {item.diseaseId.description}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <button
          className="history-refresh"
          onClick={fetchHistory}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh History"}
        </button>

      </div>
    </main>
  );
}

export default PredictionHistory;
