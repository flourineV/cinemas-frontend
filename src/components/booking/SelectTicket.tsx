import React, { useEffect, useState } from "react";
import { pricingService } from "@/services/pricing/pricingService";
import type { SeatPriceResponse } from "@/types/pricing/seatprice.type";

interface SelectTicketProps {
  seatType: string; // ghế được chọn từ booking, mặc định là NORMAL
  onTicketChange: (tickets: Record<string, number>) => void;
  selectedSeats: string[]; // Array of seat IDs
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
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-400"></div>
      </div>
    );
  if (!tickets.length)
    return (
      <p className="text-gray-300 text-center mt-6">Loại vé không tồn tại.</p>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
      {tickets.slice(0, 4).map((ticket) => {
        const key = `${ticket.seatType}-${ticket.ticketType}`;
        const count = selectedTickets[key] || 0;
        const isSelected = count > 0;

        return (
          <div
            key={key}
            className={`relative border-2 rounded-2xl shadow-lg flex flex-col justify-between items-center p-6 transition-all duration-300 ${
              isSelected
                ? "border-yellow-400 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 shadow-yellow-400/30"
                : "border-zinc-700 bg-zinc-800/60 hover:border-zinc-600"
            }`}
          >
            {/* Badge for selected count */}
            {isSelected && (
              <div className="absolute -top-3 -right-3 bg-yellow-400 text-black font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                {count}
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="flex items-center gap-2 justify-center">
                <span className="font-bold text-xl text-white">
                  {TICKET_LABELS[ticket.ticketType] || ticket.ticketType}
                </span>
                <span
                  className={`text-sm px-2 py-0.5 rounded-full ${
                    ticket.seatType === "COUPLE"
                      ? "bg-pink-500/20 text-pink-300"
                      : "bg-blue-500/20 text-blue-300"
                  }`}
                >
                  {ticket.seatType === "COUPLE" ? "Đôi" : "Đơn"}
                </span>
              </div>
              <div className="text-yellow-400 font-bold text-2xl">
                {Number(ticket.basePrice).toLocaleString()}
                <span className="text-sm ml-1">VNĐ</span>
              </div>
            </div>

            {/* Controls */}
            <div className="w-full flex items-center justify-center gap-4">
              <button
                type="button"
                aria-label={`Giảm số lượng ${ticket.ticketType}`}
                onClick={() =>
                  handleChange(ticket.seatType, ticket.ticketType, -1)
                }
                disabled={count <= 0}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-xl
                  transition-all transform active:scale-95 focus:outline-none
                  ${
                    count <= 0
                      ? "bg-zinc-700/50 text-zinc-500 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/50"
                  }`}
              >
                −
              </button>

              <div className="min-w-[60px] px-4 py-2 bg-zinc-900 border-2 border-zinc-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">{count}</span>
              </div>

              <button
                type="button"
                aria-label={`Tăng số lượng ${ticket.ticketType}`}
                onClick={() =>
                  handleChange(ticket.seatType, ticket.ticketType, 1)
                }
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold text-xl transition-all transform active:scale-95 focus:outline-none shadow-lg hover:shadow-green-500/50"
              >
                +
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SelectTicket;
