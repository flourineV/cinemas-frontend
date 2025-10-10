import { useEffect, useState } from "react";
import {
  showtimeSeatService,
  type ShowtimeSeatResponse,
  type SeatStatus,
} from "@/services/showtime/showtimeSeatService";
import { socketService } from "@/services/socketService";

interface SeatMapProps {
  showtimeId: string;
}

export default function SeatMapRealtime({ showtimeId }: SeatMapProps) {
  const [seats, setSeats] = useState<ShowtimeSeatResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Lấy danh sách ghế ban đầu ---
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const data = await showtimeSeatService.getSeatsByShowtime(showtimeId);
        setSeats(data);
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách ghế:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [showtimeId]);

  // --- Lắng nghe WebSocket cập nhật realtime ---
  useEffect(() => {
    socketService.connect(() => {
      socketService.subscribe(`/topic/showtime/${showtimeId}/seats`, (msg) => {
        const update: ShowtimeSeatResponse = JSON.parse(msg.body);
        setSeats((prev) =>
          prev.map((s) => (s.seatId === update.seatId ? update : s))
        );
      });
    });

    return () => {
      socketService.disconnect();
    };
  }, [showtimeId]);

  // --- Loading / Empty state ---
  if (loading)
    return <div className="text-center text-gray-400">Đang tải sơ đồ ghế...</div>;

  if (seats.length === 0)
    return <div className="text-center text-gray-400">Chưa có dữ liệu ghế cho suất chiếu này.</div>;

  // --- UI Sơ đồ ghế ---
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-center">Sơ đồ ghế 🎟️</h2>
      <div className="grid grid-cols-10 gap-2 justify-center max-w-3xl mx-auto">
        {seats.map((seat) => {
          const color =
            seat.status === "AVAILABLE"
              ? "bg-green-500 hover:bg-green-400"
              : seat.status === "LOCKED"
              ? "bg-yellow-500 opacity-60"
              : "bg-red-500 cursor-not-allowed";
          return (
            <button
              key={seat.seatId}
              disabled={seat.status !== "AVAILABLE"}
              onClick={() => handleSelect(seat)}
              className={`w-10 h-10 rounded text-white font-semibold transition ${color}`}
            >
              {seat.seatNumber}
            </button>
          );
        })}
      </div>
    </div>
  );

  // --- Xử lý khi click ghế ---
  async function handleSelect(seat: ShowtimeSeatResponse) {
    try {
      const newStatus: SeatStatus =
        seat.status === "AVAILABLE" ? "LOCKED" : "AVAILABLE";
      const updated = await showtimeSeatService.updateSeatStatus(
        showtimeId,
        seat.seatId,
        newStatus
      );
      setSeats((prev) =>
        prev.map((s) => (s.seatId === updated.seatId ? updated : s))
      );
    } catch (err) {
      console.error("Không thể cập nhật ghế:", err);
    }
  }
}
