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

  async put<T>(endpoint: string, data? : any): Promise<T>{
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined
    })
  } 
}

const authApiClient = new ApiClient(AUTH_BASE_URL);
const profileApiClient = new ApiClient(PROFILE_BASE_URL);

export const authService = {
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

  register: async (
    userData: any
  ): Promise<{ user: User; accessToken: string; profile?: UserProfile }> => {
    // 1. Đăng ký user (Auth Service)
    const response = await authApiClient.post<{ user: User; accessToken: string }>(
      "/api/auth/signup",
      userData
    );

    if (response.accessToken) {
      localStorage.setItem("authToken", response.accessToken);

      // 2. Nếu đăng ký thành công mới gọi tạo profile
      try {
        const profile = await profileApiClient.post<UserProfile>("/api/profile", {
          userId: response.user.id,
          email: userData.email,   // lấy từ form đăng ký ban đầu
          username: response.user.username,
          fullName: userData.name || response.user.username,
          dateOfBirth: null,
          phoneNumber: userData.phone || "",
          nationalId: ""
        });

        return { ...response, profile };
      } catch (err) {
        console.error("❌ Lỗi khi tạo profile:", err);
        // vẫn return user + token, profile có thể undefined
        return response;
      }
    }

    return response;
  },


  logout: async (): Promise<void> => {
    await authApiClient.post("/api/auth/logout");
    localStorage.removeItem("authToken");
  },

  getProfile: async (userId: string): Promise<UserProfile> => {
    return profileApiClient.get<UserProfile>(`/api/profile/${userId}`);
  },

  refresh: async (): Promise<string> => {
    const response = await authApiClient.post<{ accessToken: string }>(
      "/api/auth/refresh"
    );
    if (response.accessToken) {
      localStorage.setItem("authToken", response.accessToken);
    }
    return response.accessToken;
  },

  updateProfile: async (userId: string, data: Partial<UserProfile>): Promise<UserProfile> => {
    return profileApiClient.put<UserProfile>(`/api/profile/${userId}`, data);
  },
};
