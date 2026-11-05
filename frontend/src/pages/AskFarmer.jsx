
import { useEffect, useState } from "react";
import api from "../services/api";
import "./AskFarmer.css";

function AskFarmer() {
  const [question, setQuestion] = useState("");
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [closingId, setClosingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadQueries = async () => {
    try {
      setError("");
      const response = await api.get("/queries/my");
      setQueries(response.data.queries || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load your questions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueries();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!question.trim()) {
      setError("Please enter your question.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/queries", {
        question: question.trim(),
      });

      setQuestion("");
      setSuccess("Your question was submitted successfully.");
      await loadQueries();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit your question."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (id) => {
    setClosingId(id);
    setError("");
    setSuccess("");

    try {
      await api.patch(`/queries/${id}/close`);
      setSuccess("Question successfully closed.");
      await loadQueries();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to close this question."
      );
    } finally {
      setClosingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";
    return new Date(date).toLocaleString();
  };

  const statusLabel = {
    pending: "Waiting for farmer",
    answered: "Answered",
    closed: "Closed",
  };

  return (
    <main className="ask-page">
      <div className="ask-container">
        <header className="ask-header">
          <span className="ask-eyebrow">FARMER SUPPORT</span>
          <h1>Ask a Farmer</h1>
          <p>
            Have a question about your plants? Connect with a farmer and
            receive practical advice.
          </p>
        </header>

        <section className="ask-form-card">
          <h2>Ask your question</h2>
          <p>Describe the problem you are facing with your plants.</p>

          <form onSubmit={handleSubmit}>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Example: My tomato plant leaves are turning yellow. What could be the reason?"
              rows={5}
              required
            />

            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Question"}
            </button>
          </form>
        </section>

        {success && (
          <div className="ask-success" role="status">
            {success}
          </div>
        )}

        {error && (
          <div className="ask-error" role="alert">
            {error}
          </div>
        )}

        <section className="my-queries">
          <div className="queries-heading">
            <div>
              <span className="ask-eyebrow">YOUR ACTIVITY</span>
              <h2>My Questions</h2>
            </div>
            <span className="query-count">{queries.length} Questions</span>
          </div>

          {loading ? (
            <p className="ask-message">Loading your questions...</p>
          ) : queries.length === 0 ? (
            <div className="ask-empty">
              <span>💬</span>
              <h3>No questions yet</h3>
              <p>Your submitted questions and farmer responses will appear here.</p>
            </div>
          ) : (
            <div className="query-list">
              {queries.map((item) => (
                <article className="query-card" key={item._id}>
                  <div className="query-card-top">
                    <span
                      className={`query-status status-${item.status}`}
                    >
                      {statusLabel[item.status] || item.status}
                    </span>
                    <small>{formatDate(item.createdAt)}</small>
                  </div>

                  <h3>{item.question}</h3>

                  {item.status === "pending" && (
                    <p className="query-waiting">
                      Your question is waiting for a farmer's response.
                    </p>
                  )}

                  {item.status === "answered" && (
                    <div className="farmer-response">
                      <h4>🌱 Farmer's Response</h4>
                      <p>{item.response}</p>

                      <small>
                        {item.farmerId?.farmName
                          ? `Answered by ${item.farmerId.farmName}`
                          : "Answered by a farmer"}
                      </small>

                      <button
                        type="button"
                        onClick={() => handleClose(item._id)}
                        disabled={closingId === item._id}
                      >
                        {closingId === item._id
                          ? "Closing..."
                          : "Mark as Resolved"}
                      </button>
                    </div>
                  )}

                  {item.status === "closed" && (
                    <p className="query-closed">
                      This question has been marked as resolved.
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default AskFarmer;
