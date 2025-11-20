export type SeatStatus = "AVAILABLE" | "LOCKED" | "BOOKED";
export type SeatType = "NORMAL" | "VIP" | "COUPLE";

export interface ShowtimeSeatResponse {
  seatId: string;
  seatNumber: string;
  type: SeatType;
  status: SeatStatus;
}

export interface UpdateSeatStatusRequest {
  showtimeId: string;
  seatId: string;
  status: SeatStatus;
}

export interface ShowtimeSeatsLayoutResponse {
  totalSeats: number;
  totalRows: number;
  totalColumns: number;
  seats: ShowtimeSeatResponse[];
}
