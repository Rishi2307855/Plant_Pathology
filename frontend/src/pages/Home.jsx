
import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="eyebrow">
            AI-POWERED PLANT HEALTH
          </span>

          <h1>
            Protect Your Plants.
            <br />
            <span>Detect Diseases Early.</span>
          </h1>

          <p>
            Identify plant diseases using machine learning.
            Upload a leaf photograph, receive a prediction,
            and explore treatment and prevention information.
          </p>

          <div className="hero-actions">
            <Link to="/login" className="primary-button">
              Get Started
            </Link>

            <Link to="/register" className="secondary-button">
              Create Account
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="leaf-icon">🌿</div>
          <h3>Plant Disease Detection</h3>
          <p>AI-powered disease identification</p>
          <span className="status">ML Model Integrated</span>
        </div>
      </section>

      <section className="features-section">
        <h2>What Our Platform Offers</h2>

        <div className="feature-grid">
          <article className="feature-card">
            <span>🔬</span>
            <h3>Disease Detection</h3>
            <p>
              Identify Tomato leaf diseases using our trained
              MobileNetV2 model.
            </p>
          </article>

          <article className="feature-card">
            <span>🌱</span>
            <h3>Plant Information</h3>
            <p>
              Explore plant details, common diseases,
              symptoms and treatments.
            </p>
          </article>

          <article className="feature-card">
            <span>👨‍🌾</span>
            <h3>Farmer Support</h3>
            <p>
              Submit agricultural questions and receive
              guidance from farmers.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default Home;
