
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    farmName: "",
    location: "",
    experience: "",
    bio: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        role === "farmer"
          ? "/auth/register-farmer"
          : "/auth/register";

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      if (role === "farmer") {
        Object.assign(payload, {
          phone: formData.phone.trim(),
          location: formData.location.trim(),
          farmName: formData.farmName.trim(),
          bio: formData.bio.trim(),
          ...(formData.experience !== "" && {
            experience: Number(formData.experience),
          }),
        });
      }

      const response = await api.post(endpoint, payload);

      navigate("/login", {
        replace: true,
        state: {
          registrationSuccess:
            response.data.message || "Registration successful. Please log in.",
        },
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <section className="register-card">
        <div className="register-heading">
          <span className="register-icon">🌿</span>
          <span className="register-eyebrow">JOIN OUR COMMUNITY</span>
          <h1>Create your account</h1>
          <p>Get started with smarter plant health management.</p>
        </div>

        <div className="register-role">
          <label htmlFor="accountType">Account type</label>
          <select
            id="accountType"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="user">Regular User</option>
            <option value="farmer">Farmer</option>
          </select>
        </div>

        {error && (
          <div className="register-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="register-fields">
            <div className="register-field">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {role === "farmer" && (
            <div className="farmer-fields">
              <h3>Farmer Details</h3>

              <div className="register-fields">
                <div className="register-field">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="register-field">
                  <label htmlFor="location">Farm Location</label>
                  <input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Village, city or district"
                    required
                  />
                </div>

                <div className="register-field">
                  <label htmlFor="farmName">Farm Name (Optional)</label>
                  <input
                    id="farmName"
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleChange}
                    placeholder="Enter farm name"
                  />
                </div>

                <div className="register-field">
                  <label htmlFor="experience">Experience in Years</label>
                  <input
                    id="experience"
                    type="number"
                    min="0"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="bio">About Your Farm (Optional)</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about your farming activities"
                  rows={3}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="register-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
