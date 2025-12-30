import type { PageResponse } from "@/types/PageResponse";
import { bookingClient } from "../apiClient"; // <-- Đảm bảo import đúng client instance
import type {
  CreateBookingRequest,
  FinalizeBookingRequest,
  BookingResponse,
} from "@/types/booking/booking.type";

interface BookingStatsResponse {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  refundedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
}

export const bookingService = {
  // GET /api/bookings/stats/overview
  getStatsOverview: async (
    theaterId?: string
  ): Promise<BookingStatsResponse> => {
    const params = theaterId ? { theaterId } : {};
    const res = await bookingClient.get<BookingStatsResponse>(
      "/stats/overview",
      { params }
    );
    return res.data;
  },

  // POST /api/bookings
  createBooking: async (
    data: CreateBookingRequest
  ): Promise<BookingResponse> => {
    const res = await bookingClient.post<BookingResponse>("", data);
    return res.data;
  },

  // GET /api/bookings/admin/search
  getBookings: async (params: any): Promise<PageResponse<BookingResponse>> => {
    const res = await bookingClient.get("/admin/search", { params });
    return res.data;
  },

  // GET /api/bookings/{id}
  getBookingById: async (id: string): Promise<BookingResponse> => {
    const res = await bookingClient.get<BookingResponse>(`/${id}`);
    return res.data;
  },

  // GET /api/bookings/user/{userId}
  getBookingsByUser: async (userId: string): Promise<BookingResponse[]> => {
    const res = await bookingClient.get<BookingResponse[]>(`/user/${userId}`);
    return res.data;
  },

  // PATCH /api/bookings/{id}/finalize
  finalizeBooking: async (
    id: string,
    data: FinalizeBookingRequest
  ): Promise<BookingResponse> => {
    const res = await bookingClient.patch<BookingResponse>(
      `/${id}/finalize`,
      data
    );
    return res.data;
  },

  // POST /api/bookings/{id}/cancel
  cancelBooking: async (id: string): Promise<BookingResponse> => {
    const res = await bookingClient.post<BookingResponse>(`/${id}/cancel`);
    return res.data;
  },

  // DELETE /api/bookings/{id} (Admin)
  deleteBooking: async (id: string): Promise<void> => {
    await bookingClient.delete(`/${id}`);
  },

  // GET /api/bookings/check?userId={userId}&movieId={movieId}
  checkUserBookedMovie: async (
    userId: string,
    movieId: string
  ): Promise<boolean> => {
    const res = await bookingClient.get<boolean>(`/check`, {
      params: { userId, movieId },
    });
    return res.data;
  },
};
