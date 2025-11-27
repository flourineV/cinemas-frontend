export interface SeatSelectionDetail {
  seatId: string;
  seatType: "NORMAL" | "VIP" | "COUPLE";
  ticketType: "ADULT" | "CHILD" | "STUDENT";
}

export interface SingleSeatLockRequest {
  userId?: string;
  guestSessionId?: string;
  showtimeId: string;
  selectedSeat: SeatSelectionDetail;
}

export interface SeatLockRequest {
  userId?: string;
  guestSessionId?: string;
  showtimeId: string;
  selectedSeats: SeatSelectionDetail[];
}

export interface SeatLockResponse {
  showtimeId: string;
  seatId: string;
  status: "LOCKED" | "AVAILABLE" | "ALREADY_LOCKED" | "BOOKED";
  ttl: number; // seconds remaining until expiration
}

export interface SeatReleaseRequest {
  showtimeId: string;
  seatIds: string[];
  bookingId?: string;
  reason?: string;
}
