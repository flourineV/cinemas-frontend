import React, { useEffect, useState } from "react";
import { pricingService } from "@/services/pricing/pricingService";
import type { SeatPriceResponse } from "@/types/pricing/seatprice.type";
import { Ticket } from "lucide-react";

interface SelectTicketProps {
  seatType: string;
  onTicketChange: (tickets: Record<string, number>) => void;
  selectedSeats: string[];
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
  }, []);

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  if (!tickets.length)
    return (
      <p className="text-zinc-500 text-center mt-6 italic">
        Loại vé không tồn tại.
      </p>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto mt-10">
      {tickets.slice(0, 4).map((ticket) => {
        const key = `${ticket.seatType}-${ticket.ticketType}`;
        const count = selectedTickets[key] || 0;
        const isSelected = count > 0;

        return (
          // --- WRAPPER DIV ---
          // Dùng để chứa Badge (badge sẽ nằm đè lên border của Card bên trong)
          <div key={key} className="relative group">
            {/* --- BADGE SỐ LƯỢNG (Đưa ra ngoài Card để không bị overflow cắt) --- */}
            {isSelected && (
              <div className="absolute -top-3 -right-3 bg-yellow-500 text-black font-extrabold rounded-full w-8 h-8 flex items-center justify-center shadow-lg z-30 animate-in zoom-in duration-200 border-2 border-zinc-900">
                {count}
              </div>
            )}

            {/* --- CARD MAIN CONTENT --- */}
            {/* Giữ overflow-hidden để cắt góc cho thanh vàng bên dưới */}
            <div
              className={`relative h-full border rounded-2xl flex flex-col justify-between items-center p-6 transition-all duration-300 overflow-hidden ${
                isSelected
                  ? "bg-zinc-900 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                  : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"
              }`}
            >
              {/* --- LỚP MÀU VÀNG CỐ ĐỊNH --- */}
              <div className="absolute bottom-0 left-0 w-full h-4 bg-yellow-500"></div>

              {/* Header */}
              <div className="relative z-10 flex flex-col items-center gap-3 mb-2 w-full">
                <div className="flex items-center gap-2 justify-center">
                  <Ticket
                    className={`w-5 h-5 ${
                      isSelected ? "text-yellow-500" : "text-zinc-600"
                    }`}
                  />
                  <span className="font-bold text-xl text-white tracking-wide">
                    {TICKET_LABELS[ticket.ticketType] || ticket.ticketType}
                  </span>

                  {/* Tag loại ghế */}
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                      ticket.seatType === "COUPLE"
                        ? "border-pink-500/30 text-pink-500 bg-pink-500/10"
                        : "border-zinc-400 text-zinc-300 bg-zinc-800"
                    }`}
                  >
                    {ticket.seatType === "COUPLE" ? "Đôi" : "Đơn"}
                  </span>
                </div>

                {/* Giá tiền */}
                <div className="text-yellow-500 font-semibold text-2xl tracking-tighter">
                  {Number(ticket.basePrice).toLocaleString()}
                  <span className="text-sm font-normal text-zinc-500 ml-1 align-top relative top-1">
                    đ
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="relative z-10 w-full flex items-center justify-center gap-4 p-2">
                <button
                  type="button"
                  aria-label="Giảm"
                  onClick={() =>
                    handleChange(ticket.seatType, ticket.ticketType, -1)
                  }
                  disabled={count <= 0}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-xl transition-all
                  ${
                    count <= 0
                      ? "text-zinc-700 cursor-not-allowed"
                      : "bg-zinc-800 text-white hover:bg-zinc-700 hover:text-red-400 active:scale-95"
                  }`}
                >
                  −
                </button>

                <div className="min-w-[50px] text-center font-mono text-xl text-white font-bold">
                  {count}
                </div>

                <button
                  type="button"
                  aria-label="Tăng"
                  onClick={() =>
                    handleChange(ticket.seatType, ticket.ticketType, 1)
                  }
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-500 text-black font-bold text-xl transition-all hover:bg-yellow-400 active:scale-95 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                >
                  +
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
