import React, { useEffect, useState } from "react";
import { pricingService } from "@/services/pricing/pricingService";
import type { SeatPriceResponse } from "@/types/pricing/seatprice.type";
import type { ShowtimeSeatResponse } from "@/types/showtime/showtimeSeat.type";

interface SelectTicketProps {
  seatType: string; // ghế được chọn từ booking, mặc định là NORMAL
  onTicketChange: (tickets: Record<string, number>) => void;
  selectedSeats: ShowtimeSeatResponse[];
}

const TICKET_LABELS: Record<string, string> = {
  ADULT: "Người lớn",
  CHILD: "Trẻ em",
  STUDENT: "HSSV-U22",
  COUPLE: "Đôi",
};

const SelectTicket: React.FC<SelectTicketProps> = ({
  seatType,
  onTicketChange,
  selectedSeats,
}) => {
  const [tickets, setTickets] = useState<SeatPriceResponse[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const allPrices = await pricingService.getAllSeatPrices();
        // Lọc lấy giá cho NORMAL và COUPLE (không lấy VIP)
        const normalPrices = allPrices.filter(
          (t) => t.seatType === "NORMAL" || t.seatType === "COUPLE"
        );
        setTickets(normalPrices);
      } catch (err) {
        console.error("Không lấy được dữ liệu ticket:", err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []); // Không còn dependency vào seatType

  const handleChange = (
    seatType: string,
    ticketType: string,
    delta: number
  ) => {
    const key = `${seatType}-${ticketType}`;
    const newCount = Math.max((selectedTickets[key] || 0) + delta, 0);
    const updated = { ...selectedTickets, [key]: newCount };
    setSelectedTickets(updated);
    onTicketChange(updated);
  };

  if (loading)
    return <p className="text-white text-center mt-6">Đang tải loại vé...</p>;
  if (!tickets.length)
    return (
      <p className="text-white text-center mt-6">Loại vé không tồn tại.</p>
    );

  return (
    // container fixed 2 columns, giới hạn max width, căn giữa
    <div className="grid grid-cols-2 gap-8 w-full max-w-3xl mx-auto">
      {tickets.slice(0, 4).map((ticket) => {
        // slice(0,4) để chắc chắn 2x2
        const key = `${ticket.seatType}-${ticket.ticketType}`;
        const count = selectedTickets[key] || 0;

        return (
          <div
            key={key}
            // aspect-square giữ card vuông; flex-col + justify-between để bố trí nội dung
            className="border border-yellow-800 bg-zinc-900/40 rounded-xl shadow-md flex flex-col justify-between items-center pb-7 pt-5"
          >
            {/* header: title + seat type */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-baseline gap-2 justify-center">
                <span className="font-semibold text-lg text-white">
                  {TICKET_LABELS[ticket.ticketType] || ticket.ticketType}
                </span>
                <span className="text-gray-400 text-md">
                  ({ticket.seatType === "COUPLE" ? "Đôi" : "Đơn"})
                </span>
              </div>
              <div className="text-yellow-400 font-semibold text-lg text-center pt-2">
                {Number(ticket.basePrice).toLocaleString()} VNĐ
              </div>
            </div>

            {/* controls - đặt ở đáy card */}
            <div className="w-full flex items-center justify-center gap-4 pt-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label={`Giảm số lượng ${ticket.ticketType}`}
                  onClick={() =>
                    handleChange(ticket.seatType, ticket.ticketType, -1)
                  }
                  disabled={count <= 0}
                  className={`w-9 h-9 flex items-center justify-center rounded-full 
                    transition transform active:scale-95 focus:outline-none
                    ${count <= 0 ? "bg-zinc-800/60 text-zinc-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"}`}
                >
                  <span className="text-lg font-bold select-none pb-1">-</span>
                </button>

                <div className="min-w-[36px] px-2 py-1 bg-zinc-800 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{count}</span>
                </div>

                <button
                  type="button"
                  aria-label={`Tăng số lượng ${ticket.ticketType}`}
                  onClick={() =>
                    handleChange(ticket.seatType, ticket.ticketType, 1)
                  }
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-green-600 hover:bg-green-700 text-white transition transform active:scale-95 focus:outline-none"
                >
                  <span className="text-lg font-bold select-none pb-1">+</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SelectTicket;
