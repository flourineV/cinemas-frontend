import { showtimeClient } from "@/services/apiClients/showtimeClient"; // ông sửa lại path nếu khác
import type {
  ShowtimeRequest,
  ShowtimeResponse,
} from "@/types/showtime/showtime.type";

export const showtimeService = {
  async getAllShowtimes(): Promise<ShowtimeResponse[]> {
    const res = await showtimeClient.get("/showtimes");
    return res.data;
  },

  async getShowtimeById(id: string): Promise<ShowtimeResponse> {
    const res = await showtimeClient.get(`/showtimes/${id}`);
    return res.data;
  },

  async getShowtimesByMovie(movieId: string): Promise<ShowtimeResponse[]> {
    const res = await showtimeClient.get(`/showtimes/by-movie/${movieId}`);
    return res.data;
  },

  async getShowtimesByTheaterAndDate(
    theaterId: string,
    startDate: string,
    endDate: string
  ): Promise<ShowtimeResponse[]> {
    const res = await showtimeClient.get(`/showtimes/by-theater`, {
      params: { theaterId, startDate, endDate },
    });
    return res.data;
  },

  async createShowtime(payload: ShowtimeRequest): Promise<ShowtimeResponse> {
    const res = await showtimeClient.post("/showtimes", payload);
    return res.data;
  },

  async updateShowtime(
    id: string,
    payload: ShowtimeRequest
  ): Promise<ShowtimeResponse> {
    const res = await showtimeClient.put(`/showtimes/${id}`, payload);
    return res.data;
  },

  async deleteShowtime(id: string): Promise<void> {
    await showtimeClient.delete(`/showtimes/${id}`);
  },
};
