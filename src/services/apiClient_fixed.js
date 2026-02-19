import axios from "axios";

// Configuration
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

console.log("[API CLIENT] Base URL:", API_BASE_URL);

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include token and org-id
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    const orgId = localStorage.getItem("orgId") || "101";

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[API] Token sent:", token.substring(0, 20) + "...");
    } else {
      console.warn("[API] WARNING: No auth token found!");
    }

    config.headers["org-id"] = orgId;
    console.log("[API] Org ID:", orgId);

    console.log("[API] Making request to:", config.url);
    return config;
  },
  (error) => {
    console.error("[API] Request preparation error:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      "[API] Response from:",
      response.config.url,
      "Status:",
      response.status,
    );
    return response;
  },
  (error) => {
    console.error("[API] Response error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
    });

    if (error.response?.status === 401) {
      console.warn("[API] 401 Unauthorized - redirecting to login");
      localStorage.removeItem("authToken");
      localStorage.removeItem("orgId");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
