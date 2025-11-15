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
  startTime: string; // ISO date-time
  endTime: string; // ISO date-time
}

export interface ShowtimesByDate {
  [date: string]: ShowtimeResponse[];
}

export interface MovieShowtimeResponse {
  availableDates: string[]; // ["2025-11-16", "2025-11-17", ...]
  showtimesByDate: ShowtimesByDate;
}
