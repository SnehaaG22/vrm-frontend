import React, { useState, useEffect } from "react";
import { notificationsService } from "../services";
import { useAuth } from "../context/AuthContext";
import "../styles/pages.css";

/**
 * NOTIFICATIONS PAGE
 *
 * API Flow:
 * 1. GET /notifications/?page=1 - List all notifications
 * 2. GET /notifications/unread-count/ - Get unread count for badge
 * 3. PATCH /notifications/{id}/mark-read/ - Mark single as read
 * 4. POST /notifications/read-all/ - Mark all as read
 *
 * Headers:
 * - Authorization: Bearer <token>
 * - org-id: <org_id>
 *
 * Response format:
 * {
 *   count: 127,
 *   next: "/notifications/?page=2",
 *   previous: null,
 *   results: [
 *     {
 *       id: 1,
 *       type: "evidence_upload",
 *       message: "New evidence uploaded for question 42",
 *       status: "unread",
 *       created_at: "2026-02-18T10:30:45.123Z"
 *     }
 *   ]
 * }
 */
const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch notifications list
  useEffect(() => {
    fetchNotifications();
  }, [currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching notifications from:", notificationsService);
      const response = await notificationsService.getNotifications(
        currentPage,
        20,
      );

      console.log("Notifications response:", response);

      // Handle both direct array and paginated response
      const results = response?.results || response || [];
      const count = response?.count || results.length;

      setNotifications(results);
      setTotalCount(count);

      // Fetch unread count (don't fail if this endpoint doesn't exist)
      try {
        const countResponse = await notificationsService.getUnreadCount();
        setUnreadCount(countResponse?.unread_count || 0);
      } catch (countErr) {
        console.warn("Could not fetch unread count:", countErr);
        setUnreadCount(0);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Unknown error";
      setError(`Failed to load notifications: ${errorMessage}`);
      console.error("Notifications fetch error:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsService.markAsRead(notificationId);
      // Refresh the list
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      // Refresh the list
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    const icons = {
      evidence_upload: "📎",
      assessment_assigned: "📋",
      approval_needed: "⚠️",
      renewal_reminder: "🔄",
      default: "📢",
    };
    return icons[type] || icons.default;
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1>Notifications</h1>
        <div className="notification-stats">
          <span className="unread-badge">{unreadCount} Unread</span>
          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${
                notification.status === "unread" ? "unread" : ""
              }`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <small className="notification-time">
                  {formatDate(notification.created_at)}
                </small>
              </div>
              {notification.status === "unread" && (
                <button
                  className="mark-read-btn"
                  onClick={() => handleMarkAsRead(notification.id)}
                  title="Mark as read"
                >
                  ✓
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {totalCount > 20 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {Math.ceil(totalCount / 20)}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage * 20 >= totalCount}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
