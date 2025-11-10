export interface ShowtimeRequest {
  movieId: string;
  theaterId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  price: number;
}

export interface ShowtimeResponse {
  id: string;
  movieId: string;
  theaterName: string;
  roomName: string;
  startTime: string;
  endTime: string;
  price: number;
}
