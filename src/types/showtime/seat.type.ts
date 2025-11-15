export interface SeatRequest {
  roomId: string;
  seatNumber: string;
  rowLabel: string;
  columnIndex: number;
  type: string;
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
