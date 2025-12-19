export interface TheaterRequest {
  provinceId: string;
  name: string;
  address: string;
  description: string;
}

export interface TheaterResponse {
  id: string;
  name: string;
  nameEn?: string;
  address: string;
  addressEn?: string;
  description: string;
  descriptionEn?: string;
  provinceName: string;
  provinceNameEn?: string;
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
    theaterNameEn?: string;
    theaterAddress: string;
    theaterAddressEn?: string;
    showtimes: Array<{
      showtimeId: string;
      startTime: string;
      endTime: string;
    }>;
  }>;
}
