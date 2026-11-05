
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setMessage(response.data.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="forgot-page">
      <section className="forgot-card">
        <div className="forgot-icon">🔐</div>

        <span className="forgot-eyebrow">ACCOUNT RECOVERY</span>

        <h1>Forgot Password?</h1>

        <p className="forgot-description">
          Don't worry! Enter your registered email address and
          we'll send you a password reset link.
        </p>

        {message && (
          <div className="forgot-success" role="status">
            {message}
          </div>
        )}

        {error && (
          <div className="forgot-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="forgot-email">Email Address</label>

          <input
            id="forgot-email"
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <Link to="/login" className="forgot-back">
          ← Back to Login
        </Link>
      </section>
    </main>
  );
}

export default ForgotPassword;
