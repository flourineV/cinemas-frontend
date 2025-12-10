export interface TheaterRequest {
  provinceId: string;
  name: string;
  address: string;
  description: string;
}

export interface TheaterResponse {
  id: string;
  name: string;
  address: string;
  description: string;
  provinceName: string;
  imageUrl?: string;
}

export interface ShowtimeInfo {
  showtimeId: string;
  roomId: string;
  roomName: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface MovieShowtimesResponse {
  movieId: string;
  showtimes: ShowtimeInfo[];
}
