// src/services/roomService.ts
import { showtimeClient } from "../apiClient";

import type { RoomRequest, RoomResponse } from "@/types/showtime/room.type";

export const roomService = {
  createRoom: async (data: RoomRequest): Promise<RoomResponse> => {
    const res = await showtimeClient.post<RoomResponse>("/rooms", data);
    return res.data;
  },

  getRoomById: async (id: string): Promise<RoomResponse> => {
    const res = await showtimeClient.get<RoomResponse>(`/rooms/${id}`);
    return res.data;
  },

  getAllRooms: async (): Promise<RoomResponse[]> => {
    const res = await showtimeClient.get<RoomResponse[]>("/rooms");
    return res.data;
  },

  updateRoom: async (id: string, data: RoomRequest): Promise<RoomResponse> => {
    const res = await showtimeClient.put<RoomResponse>(`/rooms/${id}`, data);
    return res.data;
  },

  deleteRoom: async (id: string): Promise<void> => {
    await showtimeClient.delete(`/rooms/${id}`);
  },

  getRoomsByTheaterId: async (theaterId: string): Promise<RoomResponse[]> => {
    const res = await showtimeClient.get<RoomResponse[]>(
      `/rooms/by-theater/${theaterId}`
    );
    return res.data;
  },
};
