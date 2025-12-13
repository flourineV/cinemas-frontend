import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import SelectSeat from "@/components/booking/SelectSeat";
import SelectTicket from "@/components/booking/SelectTicket";
import BookingSummaryBar from "@/components/booking/BookingSummaryBar";
import { showtimeService } from "@/services/showtime/showtimeService";
import type { ShowtimeResponse } from "@/types/showtime/showtime.type";
import type { ShowtimeSeatResponse } from "@/types/showtime/showtimeSeat.type";

const SeatSelectionPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();

  const [showtimeDetail, setShowtimeDetail] = useState<ShowtimeResponse | null>(
    null
  );
  const [selectedTickets, setSelectedTickets] = useState<
    Record<string, number>
  >({});
  const [selectedSeats, setSelectedSeats] = useState<ShowtimeSeatResponse[]>(
    []
  );
  const [seatLockTTL, setSeatLockTTL] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Load showtime details
  useEffect(() => {
    if (!showtimeId) {
      navigate("/");
      return;
    }

    const loadShowtimeDetail = async () => {
      try {
        setLoading(true);
        const detail = await showtimeService.getShowtimeById(showtimeId);
        setShowtimeDetail(detail);
      } catch (error) {
        console.error("Error loading showtime detail:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadShowtimeDetail();
  }, [showtimeId, navigate]);

  const handleTicketSelect = (tickets: Record<string, number>) => {
    setSelectedTickets(tickets);
    setSelectedSeats([]);
  };

  const handleSeatSelect = (seats: ShowtimeSeatResponse[]) => {
    setSelectedSeats(seats);
  };

  const handleSeatLock = (ttl: number | null) => {
    setSeatLockTTL(ttl);
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) return;

    navigate("/checkout", {
      state: {
        showtimeId,
        selectedTickets,
        selectedSeats,
        showtimeDetail,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="flex justify-center items-center h-96">
          <p className="text-white text-xl">Đang tải thông tin suất chiếu...</p>
        </div>
      </div>
    );
  }

  if (!showtimeDetail) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="flex justify-center items-center h-96">
          <p className="text-white text-xl">Không tìm thấy suất chiếu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="text-white">
            <h1 className="text-2xl font-bold mb-4">Thông tin suất chiếu</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p className="text-gray-300">
                <span className="font-semibold">Rạp:</span>{" "}
                {showtimeDetail.theaterName}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Phòng:</span>{" "}
                {showtimeDetail.roomName}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Bắt đầu:</span>{" "}
                {new Date(showtimeDetail.startTime).toLocaleString("vi-VN")}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Kết thúc:</span>{" "}
                {new Date(showtimeDetail.endTime).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Chọn loại vé
              </h2>
              <SelectTicket
                seatType="NORMAL"
                onTicketChange={handleTicketSelect}
                selectedSeats={selectedSeats.map((seat) => seat.seatId)}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                Chọn ghế ngồi
              </h2>
              <SelectSeat
                showtimeId={showtimeId!}
                onSeatSelect={handleSeatSelect}
                selectedTickets={selectedTickets}
                onSeatLock={handleSeatLock}
              />
            </div>
          </div>
        </div>

        {selectedSeats.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50">
            <BookingSummaryBar
              movieTitle="Phim đang chọn"
              cinemaName={showtimeDetail.theaterName}
              totalPrice={0}
              isVisible={true}
              ttl={seatLockTTL}
              onSubmit={handleProceedToCheckout}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatSelectionPage;
