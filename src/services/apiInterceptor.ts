import type {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { getCookie } from "@/utils/cookieHelper";

export const applyInterceptors = (client: AxiosInstance): AxiosInstance => {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add Authorization header
      let token = localStorage.getItem("accessToken");

      // If not in localStorage, check cookies (remember me)
      if (!token) {
        token = getCookie("accessToken");
      }

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add Language header
      const language = localStorage.getItem("cinehub-language") || "vi";
      config.headers = config.headers || {};
      config.headers["Accept-Language"] = language;

      // Add ngrok skip browser warning header
      config.headers["ngrok-skip-browser-warning"] = "true";

      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      if (error.response) {
        console.error(
          `API Error: ${error.response.status}`,
          error.response.data
        );
        // Removed auto-redirect on 401 to allow guest access to public pages
        // Components should handle 401 errors appropriately
        // if (error.response.status === 401) {
        //   localStorage.removeItem("accessToken");
        //   window.location.href = "/";
        // }
      } else {
        console.error("Network error:", error.message);
      }
      return Promise.reject(error);
    }
  );

  return client;
};
