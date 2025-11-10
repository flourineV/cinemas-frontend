export interface SeatRequest {
  roomId: string;
  seatNumber: string;
  rowLabel: string;
  columnIndex: number;
  type: string; // NORMAL | VIP | COUPLE
}

export interface SeatResponse {
  id: string;
  roomId: string;
  roomName: string;
  seatNumber: string;
  rowLabel: string;
  columnIndex: number;
  type: string;
}
