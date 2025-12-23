import { notificationClient } from "../apiClient";

export interface NotificationResponse {
  id: string;
  userId: string;
  bookingId?: string;
  paymentId?: string;
  amount?: number;
  title: string;
  message: string;
  language?: string;
  type: "BOOKING_TICKET" | "PROMOTION" | "BOOKING_REFUNDED";
  metadata?: string;
  createdAt: string;
}

export const notificationService = {
  // GET /api/notifications
  getAllNotifications: async (): Promise<NotificationResponse[]> => {
    const res = await notificationClient.get<NotificationResponse[]>("");
    return res.data;
  },

  // GET /api/notifications/user/{userId}
  getNotificationsByUser: async (
    userId: string
  ): Promise<NotificationResponse[]> => {
    const res = await notificationClient.get<NotificationResponse[]>(
      `/user/${userId}`
    );
    return res.data;
  },
};
