import axios from "axios";

const baseURL = import.meta.env.VITE_GATEWAY_URL + "/fnb";

export const fnbClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // Nếu backend dùng cookie thì chỉnh true
});

// Request interceptor
fnbClient.interceptors.request.use(
  (config) => {
    // Nếu có token thì thêm vào
    // const token = localStorage.getItem("accessToken");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
fnbClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        "F&B API Error:",
        error.response.status,
        error.response.data
      );
    } else {
      console.error("Network error:", error.message);
    }
    return Promise.reject(error);
  }
);
