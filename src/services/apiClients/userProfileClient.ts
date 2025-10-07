import axios from "axios";

const baseURL = import.meta.env.VITE_PROFILE_URL

export const profileClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // nếu backend dùng cookie token; nếu không thì để false
});

// Optional: interceptor cho request
profileClient.interceptors.request.use(
  (config) => {
    // Nếu cần, tự động thêm token vào header
    // const token = localStorage.getItem("accessToken");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: interceptor cho response
profileClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("Profile API Error:", error.response.status, error.response.data);
    } else {
      console.error("Network error:", error.message);
    }
    return Promise.reject(error);
  }
);