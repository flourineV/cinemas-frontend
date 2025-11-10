// src/services/theaterService.ts
import { showtimeClient } from "../apiClients/showtimeClient";

import type {
  TheaterRequest,
  TheaterResponse,
} from "@/types/showtime/theater.type";

export const theaterService = {
  createTheater: async (data: TheaterRequest): Promise<TheaterResponse> => {
    const res = await showtimeClient.post<TheaterResponse>("/theaters", data);
    return res.data;
  },

  getTheaterById: async (id: string): Promise<TheaterResponse> => {
    const res = await showtimeClient.get<TheaterResponse>(`/theaters/${id}`);
    return res.data;
  },

  getAllTheaters: async (): Promise<TheaterResponse[]> => {
    const res = await showtimeClient.get<TheaterResponse[]>("/theaters");
    return res.data;
  },

  getTheatersByProvince: async (
    provinceId: string
  ): Promise<TheaterResponse[]> => {
    const res = await showtimeClient.get<TheaterResponse[]>(
      "/theaters/search",
      {
        params: {
          provinceId: provinceId,
        },
      }
    );
    return res.data;
  },

  updateTheater: async (
    id: string,
    data: TheaterRequest
  ): Promise<TheaterResponse> => {
    const res = await showtimeClient.put<TheaterResponse>(
      `/theaters/${id}`,
      data
    );
    return res.data;
  },

  deleteTheater: async (id: string): Promise<void> => {
    await showtimeClient.delete(`/theaters/${id}`);
  },
};
