export interface RoomRequest {
  theaterId: string;
  name: string;
  seatCount: number;
}

export interface RoomResponse {
  id: string;
  name: string;
  seatCount: number;
  theaterName: string;
}
