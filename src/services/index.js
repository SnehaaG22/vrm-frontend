import apiClient from "./apiClient";

/**
 * AUTH SERVICE
 * Handles login and user profile management
 */

export const authService = {
  /**
   * POST /auth/login/
   * Authenticates user with email and password
   * Returns token and user details
   */
  login: (email, password) => {
    return apiClient.post("/auth/login/", {
      email,
      password,
    });
  },

  /**
   * GET /users/me/
   * Retrieves current authenticated user profile
   * Returns user details including id, email, org_id, role
   */
  getCurrentUser: () => {
    return apiClient.get("/users/me/");
  },

  /**
   * Stores auth token and org_id in localStorage
   */
  setAuthToken: (token, orgId) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("orgId", orgId);
  },

  /**
   * Clears all auth data from localStorage
   */
  clearAuth: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("orgId");
    localStorage.removeItem("user");
  },

  /**
   * Retrieves stored auth token
   */
  getAuthToken: () => {
    return localStorage.getItem("authToken");
  },

  /**
   * Checks if user is currently authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("authToken");
  },
};

/**
 * NOTIFICATIONS SERVICE
 * Handles reading, marking notifications as read
 */

export const notificationsService = {
  /**
   * GET /notifications/?page=1
   * Retrieves all notifications with pagination
   * Response includes count, next, previous, results
   */
  getNotifications: (page = 1, pageSize = 20) => {
    return apiClient.get(`/notifications/`, {
      params: {
        page,
        page_size: pageSize,
      },
    });
  },

  /**
   * GET /notifications/unread-count/
   * Gets count of unread notifications
   * Returns { unread_count, total_count }
   * Useful for badge display in header
   */
  getUnreadCount: () => {
    return apiClient.get("/notifications/unread-count/");
  },

  /**
   * PATCH /notifications/{id}/mark-read/
   * Marks single notification as read
   * Returns { status: "ok" }
   */
  markAsRead: (notificationId) => {
    return apiClient.patch(`/notifications/${notificationId}/mark-read/`, {});
  },

  /**
   * POST /notifications/read-all/
   * Marks all notifications for organization as read
   * Idempotent operation
   * Returns { status: "ok" }
   */
  markAllAsRead: () => {
    return apiClient.post("/notifications/read-all/", {});
  },
};

/**
 * EVIDENCE SERVICE
 * Handles evidence file uploads and retrieval
 */

export const evidenceService = {
  /**
   * POST /evidence/upload/
   * Uploads evidence file with metadata
   *
   * Payload:
   * {
   *   assessment_id: 10,
   *   question_id: 42,
   *   file_url: "https://minio.../file.pdf",
   *   expiry_date: "2026-12-31",
   *   file_type: "pdf",
   *   org_id: 101,
   *   uploaded_by: 5
   * }
   *
   * Returns:
   * {
   *   detail: "Evidence uploaded",
   *   id: 156,
   *   created_at: "2026-02-18T11:45:30Z"
   * }
   */
  uploadEvidence: (payload) => {
    return apiClient.post("/evidence/upload/", payload);
  },

  /**
   * GET /evidence/list/
   * Retrieves list of evidence files with optional filters
   *
   * Query params:
   * - assessment_id: Filter by assessment
   * - question_id: Filter by question
   * - uploaded_by: Filter by uploader
   * - ordering: Sort by field (e.g., -created_at for newest first)
   * - page: Page number for pagination
   *
   * Returns:
   * {
   *   count: 45,
   *   results: [
   *     {
   *       id: 156,
   *       assessment_id: 10,
   *       question_id: 42,
   *       file_url: "...",
   *       expiry_date: "2026-12-31",
   *       expires_in_days: 318,
   *       created_at: "2026-02-18T11:45:30Z"
   *     }
   *   ]
   * }
   */
  listEvidence: (filters = {}, page = 1, pageSize = 20) => {
    return apiClient.get("/evidence/list/", {
      params: {
        ...filters,
        page,
        page_size: pageSize,
      },
    });
  },

  /**
   * GET /evidence/list/?assessment_id={id}
   * Retrieves evidence for specific assessment
   */
  getEvidenceByAssessment: (assessmentId, page = 1) => {
    return apiClient.get("/evidence/list/", {
      params: {
        assessment_id: assessmentId,
        page,
        page_size: 20,
      },
    });
  },

  /**
   * Helper to calculate if evidence is expiring soon
   * Based on expires_in_days from backend
   */
  getExpiryWarning: (expiresInDays) => {
    if (expiresInDays < 0) return { level: "expired", message: "Expired" };
    if (expiresInDays < 7)
      return { level: "critical", message: `Expires in ${expiresInDays} days` };
    if (expiresInDays < 30)
      return { level: "warning", message: `Expires in ${expiresInDays} days` };
    return { level: "ok", message: `Valid for ${expiresInDays} more days` };
  },
};
