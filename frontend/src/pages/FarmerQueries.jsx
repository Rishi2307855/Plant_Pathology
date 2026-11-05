
import { useEffect, useState } from "react";
import api from "../services/api";
import "./FarmerQueries.css";

function FarmerQueries() {
  const [queries, setQueries] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadQueries = async () => {
    try {
      setError("");
      const response = await api.get("/queries/available");
      setQueries(response.data.queries || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load available questions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueries();
  }, []);

  const handleResponseChange = (id, value) => {
    setResponses((previous) => ({
      ...previous,
      [id]: value,
    }));
  };

  const handleSubmitResponse = async (id) => {
    const responseText = responses[id]?.trim();

    if (!responseText) {
      setError("Please enter a response before submitting.");
      return;
    }

    setSubmitting(id);
    setError("");
    setSuccess("");

    try {
      await api.patch(`/queries/${id}/respond`, {
        response: responseText,
      });

      setSuccess("Your answer has been submitted successfully.");
      setResponses((previous) => {
        const updated = { ...previous };
        delete updated[id];
        return updated;
      });

      await loadQueries();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit your answer."
      );
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <main className="farmer-queries-page">
      <div className="farmer-queries-container">
        <header className="farmer-queries-header">
          <span className="farmer-queries-eyebrow">FARMER COMMUNITY</span>
          <h1>Questions from Users</h1>
          <p>
            Help plant owners by sharing your farming knowledge and
            experience.
          </p>
        </header>

        {success && (
          <div className="farmer-query-success" role="status">
            {success}
          </div>
        )}

        {error && (
          <div className="farmer-query-error" role="alert">
            {error}
          </div>
        )}

        <section className="available-queries">
          <div className="available-queries-heading">
            <h2>Available Questions</h2>
            <span>{queries.length} Pending</span>
          </div>

          {loading ? (
            <p className="farmer-query-message">Loading questions...</p>
          ) : queries.length === 0 ? (
            <div className="farmer-query-empty">
              <span>🌱</span>
              <h3>No pending questions</h3>
              <p>
                New questions from users will appear here when they are
                submitted.
              </p>
            </div>
          ) : (
            <div className="farmer-query-list">
              {queries.map((item) => (
                <article className="farmer-query-card" key={item._id}>
                  <div className="farmer-query-meta">
                    <span className="farmer-pending-badge">Pending response</span>
                    <small>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "Date unavailable"}
                    </small>
                  </div>

                  <div className="farmer-question-author">
                    Asked by: <strong>{item.userId?.name || "User"}</strong>
                  </div>

                  <h3>{item.question}</h3>

                  <div className="farmer-answer-area">
                    <label htmlFor={`response-${item._id}`}>
                      Your Answer
                    </label>

                    <textarea
                      id={`response-${item._id}`}
                      rows={4}
                      placeholder="Write helpful advice for this user..."
                      value={responses[item._id] || ""}
                      onChange={(event) =>
                        handleResponseChange(item._id, event.target.value)
                      }
                    />

                    <button
                      type="button"
                      onClick={() => handleSubmitResponse(item._id)}
                      disabled={submitting === item._id}
                    >
                      {submitting === item._id
                        ? "Submitting..."
                        : "Submit Answer"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <button
          className="farmer-query-refresh"
          type="button"
          onClick={() => {
            setLoading(true);
            loadQueries();
          }}
          disabled={loading}
        >
          Refresh Questions
        </button>
      </div>
    </main>
  );
}

export default FarmerQueries;
