export interface SeatSelectionDetail {
  seatId: string;
  seatType: string;
  ticketType: string;
}

// Map từ: CreateBookingRequest.java
export interface CreateBookingRequest {
  showtimeId: string; // UUID
  selectedSeats: SeatSelectionDetail[];
  guestName?: string;
  guestEmail?: string;
  userId?: string; // UUID
  guestSessionId?: string; // UUID
}

// Inner class từ FinalizeBookingRequest
export interface CalculatedFnbItemDto {
  fnbItemId: string; // UUID
  quantity: number;
  unitPrice: number; // BigDecimal
  totalFnbItemPrice: number; // BigDecimal
}

// Map từ: FinalizeBookingRequest.java
export interface FinalizeBookingRequest {
  fnbItems: CalculatedFnbItemDto[];
  promotionCode?: string;
  refundVoucherCode?: string;
  useLoyaltyDiscount: boolean;
}

// Map từ: BookingSeatResponse (Giả định structure)
export interface BookingSeatResponse {
  seatId: string;
  seatType: string;
  ticketType: string;
  price: number;
}

// Map từ: BookingResponse.java
export interface BookingResponse {
  bookingId: string; // UUID
  bookingCode: string;
  userId?: string; // UUID
  fullName?: string; // From user-profile-service
  showtimeId: string; // UUID
  movieId?: string;
  movieTitle?: string;
  guestName?: string;
  guestEmail?: string;

  status: string; // PENDING, CONFIRMED, CANCELLED...

  totalPrice: number; // BigDecimal
  discountAmount: number;
  finalPrice: number;

  paymentMethod?: string;
  transactionId?: string;

  seats: BookingSeatResponse[];

  createdAt: string; // LocalDateTime -> string ISO
  updatedAt: string;
}

// Map từ BookingCriteria.java 
export interface BookingCriteria {
  userId?: string;         // UUID
  showtimeId?: string;     // UUID
  theaterId?: string;      // UUID
  bookingCode?: string;
  status?: string;         // PENDING, CONFIRMED, CANCELLED, v.v.
  paymentMethod?: string;
  guestName?: string;
  guestEmail?: string;

  fromDate?: string;       // ISO string, map từ LocalDateTime
  toDate?: string;         // ISO string

  minPrice?: number;       // BigDecimal -> number
  maxPrice?: number;       // BigDecimal -> number
}

