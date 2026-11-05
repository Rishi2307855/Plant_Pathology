
import { Link } from "react-router-dom";
import "./Profile.css";

function Profile() {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const initials = (user?.name || "User")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="profile-page">
      <div className="profile-container">
        <Link to="/dashboard" className="profile-back">
          ← Back to Dashboard
        </Link>

        <section className="profile-card">
          <div className="profile-avatar">{initials}</div>

          <h1>{user?.name || "User"}</h1>
          <p className="profile-subtitle">Your Plant Pathology account</p>

          <div className="profile-info">
            <div>
              <span>Full Name</span>
              <strong>{user?.name || "Not available"}</strong>
            </div>

            <div>
              <span>Email Address</span>
              <strong>{user?.email || "Not available"}</strong>
            </div>

            <div>
              <span>Account Role</span>
              <strong>{user?.role || "User"}</strong>
            </div>
          </div>

          <Link to="/dashboard" className="profile-button">
            Return to Dashboard
          </Link>
        </section>
      </div>
    </main>
  );
}

export default Profile;

