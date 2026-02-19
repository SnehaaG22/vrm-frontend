import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getAssessments } from "../services";
import "../styles/pages.css";

/**
 * ASSESSMENTS PAGE
 * Display list of assessments assigned to the user
 */
const AssessmentsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      console.log("Fetching assessments...");
      const response = await getAssessments();

      console.log("Assessments response:", response);

      // Handle both direct array and paginated response
      const results = response?.results || response || [];
      setAssessments(results);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Unknown error";
      setError(`Failed to load assessments: ${errorMessage}`);
      console.error("Assessments fetch error:", err);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="page-container">
      <nav className="top-nav">
        <div className="nav-left">
          <button onClick={() => navigate("/dashboard")} className="back-btn">
            ← Back
          </button>
          <h1>VRM</h1>
          <span className="nav-subtitle">Assessments</span>
        </div>
        <div className="nav-right">
          <span className="user-name">{user?.first_name || user?.email}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="page-content">
        <section className="list-section">
          <h2>Your Assessments</h2>

          {loading && <p className="status-message">Loading assessments...</p>}
          {error && <p className="error-message">⚠️ {error}</p>}

          {!loading && assessments.length === 0 && (
            <p className="status-message">No assessments assigned yet.</p>
          )}

          {!loading && assessments.length > 0 && (
            <div className="list-table">
              <table>
                <thead>
                  <tr>
                    <th>Assessment ID</th>
                    <th>Vendor</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((assessment) => (
                    <tr key={assessment.id}>
                      <td>{assessment.id}</td>
                      <td>{assessment.vendor_name || "N/A"}</td>
                      <td>
                        <span className="status-badge">
                          {assessment.status || "Pending"}
                        </span>
                      </td>
                      <td>
                        {new Date(assessment.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <button className="action-btn">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AssessmentsPage;
