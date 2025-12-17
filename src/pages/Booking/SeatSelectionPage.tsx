import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import SelectSeat from "@/components/booking/SelectSeat";
import SelectTicket from "@/components/booking/SelectTicket";
import BookingSummaryBar from "@/components/booking/BookingSummaryBar";
import { showtimeService } from "@/services/showtime/showtimeService";
import { pricingService } from "@/services/pricing/pricingService";
import type { ShowtimeDetailResponse } from "@/types/showtime/showtime.type";
import type { ShowtimeSeatResponse } from "@/types/showtime/showtimeSeat.type";
import type { SeatPriceResponse } from "@/types/pricing/seatprice.type";
import Swal from "sweetalert2";

const SeatSelectionPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();

  const [showtimeDetail, setShowtimeDetail] =
    useState<ShowtimeDetailResponse | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<
    Record<string, number>
  >({});
  const [selectedSeats, setSelectedSeats] = useState<ShowtimeSeatResponse[]>(
    []
  );
  const [seatLockTTL, setSeatLockTTL] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [seatPrices, setSeatPrices] = useState<SeatPriceResponse[]>([]);

  // Load showtime details and seat prices
  useEffect(() => {
    if (!showtimeId) {
      navigate("/");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [detailResult, prices] = await Promise.all([
          showtimeService.adminSearch({ showtimeId }, 0, 1),
          pricingService.getAllSeatPrices(),
        ]);

        if (detailResult.data.length === 0) {
          throw new Error("Showtime not found");
        }

        const detail = detailResult.data[0];
        setShowtimeDetail(detail);
        setSeatPrices(prices);
      } catch (error) {
        console.error("Error loading data:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [showtimeId, navigate]);

  const handleTicketSelect = (tickets: Record<string, number>) => {
    // Kiểm tra nếu đang giảm vé mà đã có ghế được lock
    const hasLockedSeats = selectedSeats.length > 0 && seatLockTTL !== null;

    if (hasLockedSeats) {
      // Kiểm tra từng loại vé xem có bị giảm không
      let hasDecrease = false;
      let decreaseDetails: string[] = [];

      Object.entries(selectedTickets).forEach(([key, currentCount]) => {
        const newCount = tickets[key] || 0;
        if (newCount < currentCount) {
          hasDecrease = true;
          const [seatType, ticketType] = key.split("-");
          const ticketLabel = seatType === "NORMAL" ? "ghế đơn" : "ghế đôi";
          const typeLabel =
            ticketType === "ADULT"
              ? "Người lớn"
              : ticketType === "CHILD"
                ? "Trẻ em"
                : "HSSV-U22";
          decreaseDetails.push(
            `${typeLabel} (${ticketLabel}): ${currentCount} → ${newCount}`
          );
        }
      });

      // Nếu có giảm vé
      if (hasDecrease) {
        Swal.fire({
          title: "Không thể giảm vé",
          html: `
            <div class="text-left">
              <p class="mb-3">Bạn đang cố gắng giảm số lượng vé khi đã chọn ghế:</p>
              <ul class="list-disc list-inside space-y-1 text-sm">
                ${decreaseDetails.map((detail) => `<li>${detail}</li>`).join("")}
              </ul>
              <p class="mt-3 text-red-600 font-medium">
                Vui lòng bỏ chọn ghế trước khi giảm số lượng vé!
              </p>
            </div>
          `,
          icon: "warning",
          confirmButtonText: "Đã hiểu",
          confirmButtonColor: "#eab308",
          scrollbarPadding: false,
        });
        return; // Không cho phép giảm vé
      }
    }

    setSelectedTickets(tickets);
    // Chỉ reset ghế khi thay đổi loại vé, không reset khi tăng số lượng
    if (selectedSeats.length > 0) {
      const currentTicketTypes = Object.keys(selectedTickets);
      const newTicketTypes = Object.keys(tickets);
      const typesChanged =
        currentTicketTypes.some((type) => !newTicketTypes.includes(type)) ||
        newTicketTypes.some((type) => !currentTicketTypes.includes(type));

      if (typesChanged) {
        setSelectedSeats([]);
        setSeatLockTTL(null);
      }
    }
  };

  const handleSeatSelect = (seats: ShowtimeSeatResponse[]) => {
    setSelectedSeats(seats);
  };

  const handleSeatLock = (ttl: number | null) => {
    setSeatLockTTL(ttl);
  };

  // Tính tổng tiền ảo dựa trên vé đã chọn (không cần chọn ghế)
  const totalPrice = useMemo(() => {
    let total = 0;

    // Tính tiền dựa trên số lượng vé đã chọn
    Object.entries(selectedTickets).forEach(([key, count]) => {
      if (count > 0) {
        const [seatType, ticketType] = key.split("-");

        const priceInfo = seatPrices.find(
          (p) => p.seatType === seatType && p.ticketType === ticketType
        );

        if (priceInfo) {
          total += Number(priceInfo.basePrice) * count;
        }
      }
    });

    return total;
  }, [selectedTickets, seatPrices]);

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

        {/* Hiển thị BookingSummaryBar khi có vé được chọn (không cần chọn ghế) */}
        {Object.values(selectedTickets).some((count) => count > 0) && (
          <BookingSummaryBar
            movieTitle={showtimeDetail.movieTitle}
            cinemaName={showtimeDetail.theaterName}
            totalPrice={totalPrice}
            isVisible={true}
            ttl={seatLockTTL}
            onSubmit={handleProceedToCheckout}
          />
        )}
      </div>
    </div>
  );
};

export default SeatSelectionPage;
