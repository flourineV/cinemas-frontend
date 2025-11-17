import { showtimeClient } from "@/services/apiClient"; // ông sửa lại path nếu khác
import type {
  ShowtimeRequest,
  ShowtimeResponse,
  MovieShowtimeResponse,
} from "@/types/showtime/showtime.type";
import { mockShowtimeData } from "@/mocks/mockShowtime";

export const showtimeService = {
  async getAllShowtimes(): Promise<ShowtimeResponse[]> {
    const res = await showtimeClient.get("");
    return res.data;
  },

  async getShowtimeById(id: string): Promise<ShowtimeResponse> {
    const res = await showtimeClient.get(`/${id}`);
    return res.data;
  },

  async getShowtimesByMovie(movieId: string): Promise<MovieShowtimeResponse> {
    try {
      const res = await showtimeClient.get(`/by-movie/${movieId}`);
      return res.data;
    } catch (err) {
      console.warn("⚠️ BE không chạy — dùng mock showtime để debug UI.");
      return mockShowtimeData;
    }
  },

  async getShowtimesByTheaterAndDate(
    theaterId: string,
    startDate: string,
    endDate: string
  ): Promise<ShowtimeResponse[]> {
    const res = await showtimeClient.get(`/by-theater`, {
      params: { theaterId, startDate, endDate },
    });
    return res.data;
  },

  async createShowtime(payload: ShowtimeRequest): Promise<ShowtimeResponse> {
    const res = await showtimeClient.post("", payload);
    return res.data;
  },

  async updateShowtime(
    id: string,
    payload: ShowtimeRequest
  ): Promise<ShowtimeResponse> {
    const res = await showtimeClient.put(`/${id}`, payload);
    return res.data;
  },

  async deleteShowtime(id: string): Promise<void> {
    await showtimeClient.delete(`/${id}`);
  },
};
