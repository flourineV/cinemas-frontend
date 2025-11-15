export interface SeatPriceRequest {
  seatType: string; // bắt buộc
  ticketType: string; // bắt buộc
  basePrice: string; // BigDecimal => string để giữ độ chính xác
  description?: string; // optional
}

export interface SeatPriceResponse {
  seatType: string; // Loại ghế: VIP, STANDARD, COUPLE,...
  ticketType: string; // LOAI VÉ: ADULT, CHILD, STUDENT,...
  basePrice: string; // BigDecimal -> string (để giữ độ chính xác)
}
