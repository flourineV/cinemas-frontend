import type { User, UserProfile } from "../types";

// Base URLs cho các service
const AUTH_BASE_URL = "http://localhost:8081";
const PROFILE_BASE_URL = "http://localhost:8082";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers = new Headers({
      "Content-Type": "application/json",
      ...options.headers,
    });

    const token = localStorage.getItem("authToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const config: RequestInit = { ...options, headers };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data as T; // Trả về đúng kiểu
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }
}

const authApiClient = new ApiClient(AUTH_BASE_URL);
const profileApiClient = new ApiClient(PROFILE_BASE_URL);

export const authService = {
  // Đăng nhập
  login: async (
    credentials: { email: string; password: string }
  ): Promise<{ user: User; accessToken: string }> => {
    const response = await authApiClient.post<{ user: User; accessToken: string }>(
      "/api/auth/signin",
      credentials
    );

    if (response.accessToken) {
      localStorage.setItem("authToken", response.accessToken);
    }

    return response;
  },

  // Đăng ký
  register: async (
    userData: any
  ): Promise<{ user: User; accessToken: string }> => {
    const response = await authApiClient.post<{ user: User; accessToken: string }>(
      "/api/auth/signup",
      userData
    );

    if (response.accessToken) {
      localStorage.setItem("authToken", response.accessToken);
    }

    return response;
  },

  // Đăng xuất
  logout: async (): Promise<void> => {
    await authApiClient.post("/api/auth/logout");
    localStorage.removeItem("authToken");
  },

  // Lấy thông tin profile
  getProfile: async (userId: string): Promise<UserProfile> => {
    return profileApiClient.get<UserProfile>(`/api/profile/${userId}`);
  },

  // Refresh token
  refresh: async (): Promise<string> => {
    const response = await authApiClient.post<{ accessToken: string }>(
      "/api/auth/refresh"
    );
    if (response.accessToken) {
      localStorage.setItem("authToken", response.accessToken);
    }
    return response.accessToken;
  },
};
