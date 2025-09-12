// API endpoints constants
export const API_ENDPOINTS = {
  // Movies
  MOVIES: '/api/movies',
  MOVIE_DETAIL: (id: string) => `/api/movies/${id}`,
  MOVIE_SHOWTIMES: (id: string) => `/api/movies/${id}/showtimes`,
  
  // Cinemas
  CINEMAS: '/api/cinemas',
  CINEMA_DETAIL: (id: string) => `/api/cinemas/${id}`,
  CINEMA_SHOWTIMES: (id: string) => `/api/cinemas/${id}/showtimes`,
  
  // Showtimes
  SHOWTIMES: '/api/showtimes',
  SHOWTIME_DETAIL: (id: string) => `/api/showtimes/${id}`,
  SHOWTIME_SEATS: (id: string) => `/api/showtimes/${id}/seats`,
  
  // Bookings
  BOOKINGS: '/api/bookings',
  BOOKING_DETAIL: (id: string) => `/api/bookings/${id}`,
  CANCEL_BOOKING: (id: string) => `/api/bookings/${id}/cancel`,
  
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  PROFILE: '/api/auth/profile',
  
  // Payment
  PAYMENT: '/api/payment',
  PAYMENT_VERIFY: '/api/payment/verify',
} as const;

// App configuration
export const APP_CONFIG = {
  APP_NAME: 'CineHub',
  VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'vi',
  SEAT_SELECTION_TIMEOUT: 15 * 60 * 1000, // 15 minutes
  MAX_SEATS_PER_BOOKING: 10,
  BOOKING_EXPIRY_TIME: 30 * 60 * 1000, // 30 minutes
} as const;

// Movie genres
export const MOVIE_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'Horror',
  'Music',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Thriller',
  'War',
  'Western',
] as const;

// Movie ratings
export const MOVIE_RATINGS = [
  'G',
  'PG',
  'PG-13',
  'R',
  'NC-17',
  'T13',
  'T16',
  'T18',
  'P',
] as const;

// Cities
export const CITIES = [
  'Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Cần Thơ',
  'Hải Phòng',
  'Nha Trang',
  'Huế',
  'Vũng Tàu',
  'Đà Lạt',
  'Buôn Ma Thuột',
] as const;

// Screen types
export const SCREEN_TYPES = [
  'Standard',
  '3D',
  'IMAX',
  '4DX',
] as const;

// Seat types
export const SEAT_TYPES = [
  'Regular',
  'VIP',
  'Couple',
] as const;

// Payment methods
export const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'PayPal',
  'Bank Transfer',
  'VNPay',
  'MoMo',
  'ZaloPay',
] as const;

// Booking status
export const BOOKING_STATUS = [
  'Pending',
  'Confirmed',
  'Cancelled',
] as const;

// Payment status
export const PAYMENT_STATUS = [
  'Pending',
  'Success',
  'Failed',
] as const;

// Time slots
export const TIME_SLOTS = {
  morning: { start: '06:00', end: '12:00', label: 'Buổi sáng' },
  afternoon: { start: '12:00', end: '18:00', label: 'Buổi chiều' },
  evening: { start: '18:00', end: '22:00', label: 'Buổi tối' },
  night: { start: '22:00', end: '23:59', label: 'Suất đêm' },
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  MOVIES: '/movies',
  MOVIE_DETAIL: (id: string) => `/movies/${id}`,
  CINEMAS: '/cinemas',
  CINEMA_DETAIL: (id: string) => `/cinemas/${id}`,
  BOOKING: '/booking',
  BOOKING_CONFIRM: '/booking/confirm',
  BOOKING_SUCCESS: '/booking/success',
  PROFILE: '/profile',
  BOOKING_HISTORY: '/profile/bookings',
  LOGIN: '/login',
  REGISTER: '/register',
  CONTACT: '/contact',
  ABOUT: '/about',
} as const;
