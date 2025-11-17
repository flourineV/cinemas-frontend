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
