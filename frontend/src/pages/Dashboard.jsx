
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const commonFeatures = [
  {
    icon: "🔬",
    title: "Disease Detection",
    description: "Upload a leaf image to identify plant diseases.",
    button: "Detect Disease",
    path: "/predict",
  },
  {
    icon: "📋",
    title: "Prediction History",
    description: "View your previous disease predictions.",
    button: "View History",
    path: "/history",
  },
  {
    icon: "🌱",
    title: "Plant Information",
    description: "Explore plants, diseases and treatments.",
    button: "Explore Plants",
    path: "/plants",
  },
  {
    icon: "👤",
    title: "My Profile",
    description: "View your account information.",
    button: "View Profile",
    path: "/profile",
  },
];

const features =
  user?.role === "farmer"
    ? [
        ...commonFeatures,
        {
          icon: "💬",
          title: "Farmer Queries",
          description: "Answer questions submitted by plant owners.",
          button: "View Questions",
          path: "/farmer-queries",
        },
      ]
    : user?.role === "user"
    ? [
        ...commonFeatures,
        {
          icon: "🌾",
          title: "Ask a Farmer",
          description: "Get farming advice from experienced farmers.",
          button: "Ask a Question",
          path: "/ask-farmer",
        },
      ]
    : [
    {
      icon: "👥",
      title: "User Management",
      description: "View registered users and farmers and manage account access.",
      button: "Manage Users",
      path: "/admin/users",
    },
    {
      icon: "🌱",
      title: "Plant Information",
      description: "Explore plants and diseases.",
      button: "Explore Plants",
      path: "/plants",
    },
    {
      icon: "👤",
      title: "My Profile",
      description: "View your account information.",
      button: "View Profile",
      path: "/profile",
    },
  ];

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="hero-label">YOUR PLANT HEALTH SPACE</span>
          <h1>Welcome, {user?.name || "User"}!</h1>
          <p>Healthy plants. A greener tomorrow.</p>
        </div>
        <span className="hero-leaf">🌿</span>
      </section>

      <section className="dashboard-grid">
        {features.map((feature) => (
          <article className="dashboard-card" key={feature.title}>
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <button onClick={() => navigate(feature.path)}>
              {feature.button} <span>→</span>
            </button>
          </article>
        ))}
      </section>

      <section className="account-card">
        <div className="account-heading">
          <span>👤</span>
          <h2>Account Information</h2>
        </div>

        <div className="account-details">
          <div>
            <small>Name</small>
            <p>{user?.name || "Not available"}</p>
          </div>
          <div>
            <small>Email</small>
            <p>{user?.email || "Not available"}</p>
          </div>
          <div>
            <small>Role</small>
            <p>{user?.role || "User"}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
