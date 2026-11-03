
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import "./App.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Prediction from "./pages/Prediction";
function App() {
  return (
    <>
      <header className="navbar">
        <Link to="/" className="brand">
          🌿 Plant Pathology
        </Link>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register" className="nav-register">
            Register
          </Link>
        </nav>
      </header>

      <Routes>
  <Route path="/" element={<Home />} />

  <Route path="/login" element={<Login />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/predict" element={<Prediction />} />

  <Route
    path="*"
    element={<h2 className="page-placeholder">Page coming soon</h2>}
  />
</Routes>
    </>
  );
}

export default App;
