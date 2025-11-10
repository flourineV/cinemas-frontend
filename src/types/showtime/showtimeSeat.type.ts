export type SeatStatus = "AVAILABLE" | "LOCKED" | "BOOKED";

export interface ShowtimeSeatResponse {
  seatId: string;
  seatNumber: string;
  status: SeatStatus;
}

export interface UpdateSeatStatusRequest {
  showtimeId: string;
  seatId: string;
  status: SeatStatus;
}
