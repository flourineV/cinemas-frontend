import { showtimeClient } from "@/services/apiClients/showtimeClient"; // ông sửa lại path nếu khác

export interface ShowtimeRequest {
  movieId: string;
  theaterId: string;
  roomId: string;
  startTime: string; // ISO string (FE -> BE)
  endTime: string;
  price: number;
}

export interface ShowtimeResponse {
  id: string;
  movieId: string;
  theaterName: string;
  roomName: string;
  startTime: string;
  endTime: string;
  price: number;
}

export const showtimeService = {
  /** Lấy tất cả lịch chiếu */
  async getAllShowtimes(): Promise<ShowtimeResponse[]> {
    const res = await showtimeClient.get("/showtimes");
    return res.data;
  },

  /** Lấy lịch chiếu theo ID */
  async getShowtimeById(id: string): Promise<ShowtimeResponse> {
    const res = await showtimeClient.get(`/showtimes/${id}`);
    return res.data;
  },

  /** Lấy lịch chiếu theo phim */
  async getShowtimesByMovie(movieId: string): Promise<ShowtimeResponse[]> {
    const res = await showtimeClient.get(`/showtimes/by-movie/${movieId}`);
    return res.data;
  },

  /** Lấy lịch chiếu theo rạp + thời gian */
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

  /** Tạo lịch chiếu mới */
  async createShowtime(payload: ShowtimeRequest): Promise<ShowtimeResponse> {
    const res = await showtimeClient.post("/showtimes", payload);
    return res.data;
  },

  /** Cập nhật lịch chiếu */
  async updateShowtime(id: string, payload: ShowtimeRequest): Promise<ShowtimeResponse> {
    const res = await showtimeClient.put(`/showtimes/${id}`, payload);
    return res.data;
  },

  /** Xóa lịch chiếu */
  async deleteShowtime(id: string): Promise<void> {
    await showtimeClient.delete(`/showtimes/${id}`);
  },
};

