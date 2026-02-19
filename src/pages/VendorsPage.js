import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getVendors } from "../services";
import "../styles/pages.css";

/**
 * VENDORS PAGE
 * Display list of vendors
 */
const VendorsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      console.log("Fetching vendors...");
      const response = await getVendors();

      console.log("Vendors response:", response);

      // Handle both direct array and paginated response
      const results = response?.results || response || [];
      setVendors(results);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Unknown error";
      setError(`Failed to load vendors: ${errorMessage}`);
      console.error("Vendors fetch error:", err);
      setVendors([]);
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
          <span className="nav-subtitle">Vendors</span>
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
          <h2>Vendor Directory</h2>

          {loading && <p className="status-message">Loading vendors...</p>}
          {error && <p className="error-message">⚠️ {error}</p>}

          {!loading && vendors.length === 0 && (
            <p className="status-message">No vendors available.</p>
          )}

          {!loading && vendors.length > 0 && (
            <div className="list-table">
              <table>
                <thead>
                  <tr>
                    <th>Vendor ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Contact</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr key={vendor.id}>
                      <td>{vendor.id}</td>
                      <td>{vendor.name || "N/A"}</td>
                      <td>{vendor.category || "General"}</td>
                      <td>
                        <span className="status-badge">
                          {vendor.status || "Active"}
                        </span>
                      </td>
                      <td>{vendor.email || vendor.phone || "N/A"}</td>
                      <td>
                        <button className="action-btn">View Details</button>
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

export default VendorsPage;
