export interface SeatPriceRequest {
  seatType: string;
  ticketType: string;
  basePrice: number;
  description: string;
  descriptionEn: string;
}

export interface SeatPriceResponse {
  id: string;
  seatType: string;
  ticketType: string;
  basePrice: number;
  description: string;
  descriptionEn: string;
}

export type SeatType = "NORMAL" | "VIP" | "COUPLE";
export type TicketType = "ADULT" | "CHILD" | "STUDENT" | "SENIOR";

export const SEAT_TYPE_LABELS: Record<SeatType, string> = {
  NORMAL: "Ghế thường",
  VIP: "Ghế VIP",
  COUPLE: "Ghế đôi",
};

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  ADULT: "Người lớn",
  CHILD: "Trẻ em",
  STUDENT: "Học sinh/Sinh viên",
  SENIOR: "Người cao tuổi",
};
