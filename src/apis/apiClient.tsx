import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout to prevent UI from freezing indefinitely
});

// Request interceptor Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    console.error("API Error:", {
      status,
      message: data?.message || error.message,
      url: error.config?.url,
    });

    // Timeout error
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return Promise.reject("Request timed out. Please verify your backend API is responding.");
    }

    // Network error / connection refused
    if (!error.response) {
      const networkMsg = `Cannot connect to backend API server at ${API_URL}. Please make sure your .NET API is running.`;
      return Promise.reject(networkMsg);
    }

    let message =
      data?.message ||
      data?.Message ||
      data?.title ||
      (typeof data === "string" ? data : null) ||
      (status === 404 ? "API Endpoint not found (404). Please restart backend API." : null) ||
      (status === 405 ? "Method not allowed (405). Please restart backend API." : null) ||
      (status ? `Request failed with status ${status}.` : "Unknown error occurred.");

    if (data?.errors && typeof data.errors === "object") {
      const firstKey = Object.keys(data.errors)[0];
      if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey].length > 0) {
        message = data.errors[firstKey][0];
      }
    }

    // Handle authentication error
    if ((status === 401 || status === 403) && !window.location.pathname.includes("/login")) {
      localStorage.removeItem("token");
      window.location.replace("/login");
    }

    return Promise.reject(message);
  }
);

export default apiClient;