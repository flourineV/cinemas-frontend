// Main types for CineHub movie booking system
export interface User {
  id: string;
  username: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
}

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  username: string;
  phoneNumber: string;
  nationalId: string;

  fullName: string | null;
  dateOfBirth: string | null; // ISO date string, ví dụ "2025-09-24T09:07:37.046925"
  gender: "MALE" | "FEMALE" | "OTHER" | null;

  avatarUrl: string | null;
  favoriteGenres: string[] | null;

  loyaltyPoint: number;
  rank: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  status: "ACTIVE" | "BANNED";

  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string[];
  duration: number; // in minutes
  rating: string;
  releaseDate: string;
  poster: string;
  trailer?: string;
  director: string;
  cast: string[];
  language: string;
  isActive: boolean;
}

export interface MovieSummary {
  id: string;
  tmdbId: number;
  title: string;
  posterUrl: string;
  age: string;
  status: string;
  time: number;
  spokenLanguages: string[];
  genres: string[];
}

export interface MovieDetail {
  id: string;
  tmdbId: number;
  title: string;
  age: string;
  genres: string[];
  time: number;               
  country: string;            
  spokenLanguages: string[];
  crew: string[];            
  cast: string[];             
  releaseDate: string;         
  overview: string;         
  trailer: string;          
  posterUrl: string;           
}

export interface Cinema {
  id: string;
  name: string;
  address: string;
  city: string;
  facilities: string[];
  screens: Screen[];
}

export interface Screen {
  id: string;
  name: string;
  totalSeats: number;
  screenType: 'Standard' | '3D' | 'IMAX' | '4DX';
  seatLayout: Seat[][];
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'Regular' | 'VIP' | 'Couple';
  isAvailable: boolean;
  price: number;
}

export interface Showtime {
  id: string;
  movieId: string;
  cinemaId: string;
  screenId: string;
  startTime: string;
  endTime: string;
  date: string;
  availableSeats: number;
  basePrice: number;
}

export interface Booking {
  id: string;
  userId: string;
  showtimeId: string;
  seats: SelectedSeat[];
  totalAmount: number;
  bookingDate: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  paymentId?: string;
}

export interface SelectedSeat {
  seatId: string;
  row: string;
  number: number;
  type: string;
  price: number;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: 'Credit Card' | 'Debit Card' | 'PayPal' | 'Bank Transfer';
  status: 'Pending' | 'Success' | 'Failed';
  transactionDate: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Form types
export interface BookingForm {
  showtimeId: string;
  selectedSeats: SelectedSeat[];
  userInfo: {
    name: string;
    email: string;
    phone: string;
  };
  paymentMethod: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

// Filter types
export interface MovieFilters {
  genre?: string;
  city?: string;
  date?: string;
  language?: string;
  rating?: string;
}

export interface ShowtimeFilters {
  movieId?: string;
  cinemaId?: string;
  date?: string;
  time?: 'morning' | 'afternoon' | 'evening' | 'night';
}
