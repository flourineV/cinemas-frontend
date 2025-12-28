import React, { useEffect, useState } from "react";
import { pricingService } from "@/services/pricing/pricingService";
import type { SeatPriceResponse } from "@/types/pricing/pricing.type";
import { Ticket } from "lucide-react";
import Swal from "sweetalert2";
import { useLanguage } from "@/contexts/LanguageContext";

interface SelectTicketProps {
  seatType: string;
  onTicketChange: (tickets: Record<string, number>) => void;
  selectedSeats?: string[];
}

const SelectTicket: React.FC<SelectTicketProps> = ({ onTicketChange }) => {
  const { t } = useLanguage();

  const TICKET_LABELS: Record<string, string> = {
    ADULT: t("ticket.adult"),
    CHILD: t("ticket.child"),
    STUDENT: t("ticket.student"),
    COUPLE: t("ticket.couple"),
  };

  const [tickets, setTickets] = useState<SeatPriceResponse[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(false);
  const [hasShownStudentWarning, setHasShownStudentWarning] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const allPrices = await pricingService.getAllSeatPrices();
        const normalPrices = allPrices.filter(
          (p) => p.seatType === "NORMAL" || p.seatType === "COUPLE"
        );
        setTickets(normalPrices);
      } catch (err) {
        console.error("Cannot fetch ticket data:", err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const handleChange = async (
    seatType: string,
    ticketType: string,
    delta: number
  ) => {
    const key = `${seatType}-${ticketType}`;
    const currentCount = selectedTickets[key] || 0;
    const newCount = Math.max(currentCount + delta, 0);

    // Check if this is the first time selecting STUDENT ticket
    if (
      ticketType === "STUDENT" &&
      delta > 0 &&
      currentCount === 0 &&
      !hasShownStudentWarning
    ) {
      await Swal.fire({
        icon: "info",
        title: t("ticket.studentNote"),
        html: t("ticket.studentNoteHtml"),
        confirmButtonText: t("ticket.understood"),
        confirmButtonColor: "#eab308",
        scrollbarPadding: false,
      });
      setHasShownStudentWarning(true);
    }

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
        {t("ticket.notExist")}
      </p>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto mt-10">
      {tickets.slice(0, 4).map((ticket) => {
        const key = `${ticket.seatType}-${ticket.ticketType}`;
        const count = selectedTickets[key] || 0;
        const isSelected = count > 0;

        return (
          <div key={key} className="relative group">
            {isSelected && (
              <div className="absolute -top-3 -right-3 bg-zinc-900 text-yellow-500 font-extrabold rounded-full w-8 h-8 flex items-center justify-center shadow-lg z-30 animate-in zoom-in duration-200 border-2 border-zinc-900">
                {count}
              </div>
            )}

            <div
              className={`relative h-full border rounded-2xl flex flex-col justify-between items-center p-6 transition-all duration-300 overflow-hidden ${
                isSelected
                  ? "bg-yellow-500 border-zinc-900"
                  : "bg-yellow-500 border-zinc-900"
              }`}
            >
              <div className="absolute bottom-0 left-0 w-full h-5 bg-zinc-900"></div>

              <div className="relative z-10 flex flex-col items-center gap-3 mb-2 w-full">
                <div className="flex items-center gap-2 justify-center">
                  <Ticket
                    className={`w-5 h-5 ${
                      isSelected ? "text-zinc-900" : "text-zinc-700"
                    }`}
                  />
                  <span className="font-bold text-xl text-black tracking-wide">
                    {TICKET_LABELS[ticket.ticketType] || ticket.ticketType}
                  </span>

                  <span
                    className={`text-[12px] uppercase font-bold px-2 py-0.5 rounded border ${
                      ticket.seatType === "COUPLE"
                        ? "border-zinc-700 text-zinc-800 bg-pink-300"
                        : "border-zinc-700 text-zinc-800 bg-pink-300"
                    }`}
                  >
                    {ticket.seatType === "COUPLE"
                      ? t("ticket.couple")
                      : t("ticket.single")}
                  </span>
                </div>

                <div className="text-red-500 font-bold text-2xl tracking-tighter">
                  {Number(ticket.basePrice).toLocaleString()}
                  <span className="text-sm font-normal text-red-500 ml-1 align-top relative top-1">
                    đ
                  </span>
                </div>
              </div>

              <div className="relative z-10 w-full flex items-center justify-center gap-4 p-2">
                <button
                  type="button"
                  aria-label="Decrease"
                  onClick={async () =>
                    await handleChange(ticket.seatType, ticket.ticketType, -1)
                  }
                  disabled={count <= 0}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-xl transition-all
                  ${
                    count <= 0
                      ? "text-yellow-700 cursor-not-allowed"
                      : "text-black hover:bg-yellow-300 hover:text-red-600 active:scale-95"
                  }`}
                >
                  −
                </button>

                <div className="min-w-[50px] text-center font-mono text-xl text-black font-bold">
                  {count}
                </div>

                <button
                  type="button"
                  aria-label="Increase"
                  onClick={async () =>
                    await handleChange(ticket.seatType, ticket.ticketType, 1)
                  }
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-zinc-800 font-bold text-xl transition-all hover:bg-zinc-800 hover:text-yellow-500 active:scale-95 border border-zinc-900"
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
