export interface SeatLockRequest {
  id: string;
  seatId: string;
  bookingId: string;
}

export interface SeatLockResponse {
  showtimeId: string;
  seatId: string;
  status: string;
  ttl: number;
}
