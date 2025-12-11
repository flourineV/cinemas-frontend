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

export interface MoviesWithTheatersResponse {
  movieId: string;
  theaters: Array<{
    theaterId: string;
    theaterName: string;
    theaterAddress: string;
    showtimes: Array<{
      showtimeId: string;
      startTime: string;
      endTime: string;
    }>;
  }>;
}
