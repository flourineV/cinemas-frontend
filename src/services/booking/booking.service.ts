import { bookingClient } from "../apiClient"; // <-- Đảm bảo import đúng client instance
import type {
  CreateBookingRequest,
  FinalizeBookingRequest,
  BookingResponse,
} from "@/types/booking/booking.type";

export const bookingService = {
  // POST /api/bookings
  createBooking: async (
    data: CreateBookingRequest
  ): Promise<BookingResponse> => {
    const res = await bookingClient.post<BookingResponse>("", data);
    return res.data;
  },

  // GET /api/bookings/{id}
  getBookingById: async (id: string): Promise<BookingResponse> => {
    const res = await bookingClient.get<BookingResponse>(`/${id}`);
    return res.data;
  },

  // GET /api/bookings/user/{userId}
  getBookingsByUser: async (userId: string): Promise<BookingResponse[]> => {
    const res = await bookingClient.get<BookingResponse[]>(
      `/bookings/user/${userId}`
    );
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
    const res = await bookingClient.post<BookingResponse>(
      `/bookings/${id}/cancel`
    );
    return res.data;
  },

  // DELETE /api/bookings/{id} (Admin)
  deleteBooking: async (id: string): Promise<void> => {
    await bookingClient.delete(`/bookings/${id}`);
  },
};
