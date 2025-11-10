import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_GATEWAY_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`API Error: ${error.response.status}`, error.response.data);
      if (error.response.status === 401) {
        console.warn("Token expired or unauthorized.");

        localStorage.removeItem("accessToken");

        window.location.href = "/login";
      }
    } else {
      console.error("Network error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
