import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/pages.css";

/**
 * DASHBOARD PAGE
 * Main entry point after login
 * Shows user profile, quick links to main features
 */
const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <nav className="top-nav">
        <div className="nav-left">
          <h1>VRM</h1>
          <span className="nav-subtitle">Vendor Risk Management</span>
        </div>
        <div className="nav-right">
          <span className="user-name">
            Welcome, {user?.first_name || user?.email}
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <section className="user-info">
          <h2>Your Profile</h2>
          <div className="info-card">
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            {user?.first_name && (
              <p>
                <strong>Name:</strong> {user.first_name} {user.last_name}
              </p>
            )}
            {user?.org_id && (
              <p>
                <strong>Organization:</strong> {user.org_id}
              </p>
            )}
            {user?.is_staff && (
              <p>
                <strong>Role:</strong> Staff / Admin
              </p>
            )}
          </div>
        </section>

        <section className="quick-links">
          <h2>Quick Actions</h2>
          <div className="links-grid">
            <button
              className="link-card"
              onClick={() => navigate("/notifications")}
            >
              <div className="card-icon">📢</div>
              <h3>Notifications</h3>
              <p>View all messages and alerts</p>
            </button>

            <button className="link-card" onClick={() => navigate("/evidence")}>
              <div className="card-icon">📎</div>
              <h3>Upload Evidence</h3>
              <p>Submit evidence files and documents</p>
            </button>

            <button
              className="link-card"
              onClick={() => navigate("/assessments")}
            >
              <div className="card-icon">📊</div>
              <h3>Assessments</h3>
              <p>View assigned assessments</p>
            </button>

            <button className="link-card" onClick={() => navigate("/vendors")}>
              <div className="card-icon">👥</div>
              <h3>Vendors</h3>
              <p>View vendor information</p>
            </button>
          </div>
        </section>

        <section className="api-reference">
          <h2>API Integration Guide</h2>
          <div className="reference-card">
            <p>All API calls require:</p>
            <code>
              Headers: {"{"}
              <br />
              &nbsp;&nbsp;"Authorization": "Bearer &lt;token&gt;",
              <br />
              &nbsp;&nbsp;"org-id": "&lt;org_id&gt;",
              <br />
              &nbsp;&nbsp;"Content-Type": "application/json"
              <br />
              {"}"}
            </code>
            <p>
              <strong>Base URL:</strong> http://localhost:8000/api
            </p>
            <p>See documentation on backend repo for full API details.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
