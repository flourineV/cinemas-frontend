import type { Movie, Showtime, Cinema, Booking, User, ApiResponse, PaginatedResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Generic API client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient(API_BASE_URL);

// Movie services
export const movieService = {
  getMovies: async (filters?: any): Promise<PaginatedResponse<Movie>> => {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    const response = await apiClient.get<PaginatedResponse<Movie>>(`/api/movies${query}`);
    return response.data;
  },

  getMovieById: async (id: string): Promise<Movie> => {
    const response = await apiClient.get<Movie>(`/api/movies/${id}`);
    return response.data;
  },

  getMovieShowtimes: async (movieId: string, date?: string): Promise<Showtime[]> => {
    const query = date ? `?date=${date}` : '';
    const response = await apiClient.get<Showtime[]>(`/api/movies/${movieId}/showtimes${query}`);
    return response.data;
  },
};

// Cinema services
export const cinemaService = {
  getCinemas: async (city?: string): Promise<Cinema[]> => {
    const query = city ? `?city=${city}` : '';
    const response = await apiClient.get<Cinema[]>(`/api/cinemas${query}`);
    return response.data;
  },

  getCinemaById: async (id: string): Promise<Cinema> => {
    const response = await apiClient.get<Cinema>(`/api/cinemas/${id}`);
    return response.data;
  },
};

// Showtime services
export const showtimeService = {
  getShowtimeById: async (id: string): Promise<Showtime> => {
    const response = await apiClient.get<Showtime>(`/api/showtimes/${id}`);
    return response.data;
  },

  getShowtimeSeats: async (id: string): Promise<any> => {
    const response = await apiClient.get<any>(`/api/showtimes/${id}/seats`);
    return response.data;
  },
};

// Booking services
export const bookingService = {
  createBooking: async (bookingData: any): Promise<Booking> => {
    const response = await apiClient.post<Booking>('/api/bookings', bookingData);
    return response.data;
  },

  getBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>('/api/bookings');
    return response.data;
  },

  getBookingById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get<Booking>(`/api/bookings/${id}`);
    return response.data;
  },

  cancelBooking: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/bookings/${id}/cancel`);
  },
};

// Auth services
export const authService = {
  login: async (credentials: { email: string; password: string }): Promise<{ user: User; token: string }> => {
    const response = await apiClient.post<{ user: User; token: string }>('/api/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  register: async (userData: any): Promise<{ user: User; token: string }> => {
    const response = await apiClient.post<{ user: User; token: string }>('/api/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
    localStorage.removeItem('authToken');
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/auth/profile');
    return response.data;
  },
};

export default apiClient;
