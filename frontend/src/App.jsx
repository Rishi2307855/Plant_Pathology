
import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Prediction from "./pages/Prediction";
import PredictionHistory from "./pages/predictionHistory";
import PlantInformation from "./pages/PlantInformation";
import Profile from "./pages/profile";
import AskFarmer from "./pages/AskFarmer";
import FarmerQueries from "./pages/FarmerQueries";
import AdminUsers from "./pages/AdminUsers";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import "./App.css";

// Authentication protection
function ProtectedRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

// Role-based protection
function RoleRoute({ user, role, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Main App
function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  // Synchronize authentication changes
  useEffect(() => {
    const syncAuth = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user") || "null"));
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("auth-change", syncAuth);

    return () => {
      window.removeEventListener("auth-change", syncAuth);
    };
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    window.dispatchEvent(new Event("auth-change"));

    navigate("/");
  };

  return (
    <>
      {/* Navbar */}
      <header className="navbar">
        <Link to="/" className="brand">
          {user ? (
            <span className="brand-icon" aria-label="Home">
              🌿
            </span>
          ) : (
            <>
              <span className="brand-icon">🌿</span>
              <span>Plant Pathology</span>
            </>
          )}
        </Link>

        <nav>
          <Link to="/">Home</Link>

          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>

              <button
                onClick={handleLogout}
                className="nav-logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>

              <Link to="/register" className="nav-register">
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Application Routes */}
      <Routes>
<Route
  path="/reset-password"
  element={<ResetPassword />}
/>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* General Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/predict"
          element={
            <ProtectedRoute user={user}>
              <Prediction />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute user={user}>
              <PredictionHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/plants"
          element={
            <ProtectedRoute user={user}>
              <PlantInformation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Regular User Only */}
        <Route
          path="/ask-farmer"
          element={
            <RoleRoute user={user} role="user">
              <AskFarmer />
            </RoleRoute>
          }
        />

        {/* Farmer Only */}
        <Route
          path="/farmer-queries"
          element={
            <RoleRoute user={user} role="farmer">
              <FarmerQueries />
            </RoleRoute>
          }
        />

        {/* Admin Only */}
        <Route
          path="/admin/users"
          element={
            <RoleRoute user={user} role="admin">
              <AdminUsers />
            </RoleRoute>
          }
        />

        {/* Unknown Routes */}
        <Route
          path="*"
          element={
            <h2 className="page-placeholder">
              Page coming soon
            </h2>
          }
        />

      </Routes>
    </>
  );
}

export default App;
