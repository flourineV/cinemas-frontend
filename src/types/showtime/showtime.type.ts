export interface ShowtimeRequest {
  movieId: string;
  theaterId: string;
  roomId: string;
  startTime: string;
  endTime: string;
}

export interface ShowtimeResponse {
  id: string;
  movieId: string;
  theaterName: string;
  roomId: string;
  roomName: string;
  startTime: string;
  endTime: string;
}

export interface ShowtimeDetailResponse {
  id: string;
  movieId: string;
  movieTitle: string;
  theaterId: string;
  theaterName: string;
  provinceId: string;
  provinceName: string;
  roomId: string;
  roomName: string;
  startTime: string;
  endTime: string;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
}

export interface ShowtimeConflictResponse {
  hasConflict: boolean;
  message: string;
  conflictingShowtimes: ShowtimeResponse[];
}

export interface BatchShowtimeRequest {
  showtimes: ShowtimeRequest[];
  skipOnConflict: boolean; // true: skip conflicting ones, false: fail entire batch
}

export interface BatchShowtimeResponse {
  totalRequested: number;
  successCount: number;
  failedCount: number;
  createdShowtimes: ShowtimeResponse[];
  errors: string[];
}

export interface ShowtimesByDate {
  [date: string]: ShowtimeResponse[];
}

export interface MovieShowtimeResponse {
  availableDates: string[];
  showtimesByDate: ShowtimesByDate;
}

export interface ShowtimeInfo {
  showtimeId: string;
  roomId: string;
  roomName: string;
  startTime: string;
  endTime: string;
}

export interface TheaterShowtimesResponse {
  theaterId: string;
  theaterName: string;
  theaterAddress: string;
  showtimes: ShowtimeInfo[];
}

// Seat Lock Types
export interface SeatSelectionDetail {
  seatId: string;
  seatType: "NORMAL" | "VIP" | "COUPLE";
  ticketType: "ADULT" | "CHILD" | "STUDENT";
}

export interface SeatLockRequest {
  userId?: string;
  guestName?: string;
  guestEmail?: string;
  showtimeId: string;
  selectedSeats: SeatSelectionDetail[];
}

export interface SeatLockResponse {
  showtimeId: string;
  seatId: string;
  status: "LOCKED" | "AVAILABLE" | "ALREADY_LOCKED";
  ttl: number; // seconds remaining until expiration
}

export interface SeatReleaseRequest {
  showtimeId: string;
  seatIds: string[];
  bookingId?: string;
  reason?: string;
}
