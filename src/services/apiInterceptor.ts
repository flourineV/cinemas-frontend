import type {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

export const applyInterceptors = (client: AxiosInstance): AxiosInstance => {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
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
        if (error.response.status === 401) {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
      } else {
        console.error("Network error:", error.message);
      }
      return Promise.reject(error);
    }
  );

  return client;
};
