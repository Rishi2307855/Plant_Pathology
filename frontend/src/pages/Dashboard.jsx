
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">PLANT PATHOLOGY</span>
          <h1>Welcome, {user?.name || "User"}!</h1>
          <p>Your plant health dashboard</p>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <span>🔬</span>
          <h3>Disease Detection</h3>
          <p>Upload a Tomato leaf image to identify possible diseases.</p>
          <button onClick={() => navigate("/predict")}>
            Detect Disease
          </button>
        </div>

        <div className="dashboard-card">
          <span>📋</span>
          <h3>Prediction History</h3>
          <p>View your previously analysed leaf images and results.</p>
          <button onClick={() => navigate("/history")}>
            View History
          </button>
        </div>

        <div className="dashboard-card">
          <span>🌱</span>
          <h3>Plant Information</h3>
          <p>Explore plants, diseases, symptoms and treatments.</p>
          <button onClick={() => navigate("/plants")}>
            Explore Plants
          </button>
        </div>
      </div>

      <div className="account-card">
        <h3>Account Information</h3>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
      </div>
    </div>
  );
}

export default Dashboard;
