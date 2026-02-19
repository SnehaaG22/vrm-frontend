import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/pages.css";

/**
 * LOGIN PAGE
 *
 * API Flow:
 * 1. User enters email and password
 * 2. POST /auth/login/ with {email, password}
 * 3. Backend returns {token, user}
 * 4. Store token and org_id in localStorage
 * 5. Redirect to /dashboard
 *
 * Headers sent after login:
 * - Authorization: Bearer <token>
 * - org-id: <org_id>
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        // Navigate to dashboard/home page
        navigate("/dashboard");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>VRM Platform</h1>
        <h2>Vendor Risk Management</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-info">
          <p>
            <strong>Demo Credentials:</strong>
          </p>
          <p>Admin: admin@vrm.com / password123</p>
          <p>Vendor: vendor@vrm.com / password123</p>
          <p>Reviewer: reviewer@vrm.com / password123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
