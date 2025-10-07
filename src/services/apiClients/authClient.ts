import axios from "axios";

const baseURL = import.meta.env.VITE_AUTH_URL;

export const authClient = axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: false,
})

authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized: token expired or invalid.");
      // Tùy logic, có thể redirect hoặc refresh token ở đây
    }
    return Promise.reject(error);
  }
);