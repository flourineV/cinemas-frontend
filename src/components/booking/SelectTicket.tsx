import React, { useEffect, useState } from "react";
import { pricingService } from "@/services/pricing/pricingService";
import type { SeatPriceResponse } from "@/types/pricing/seatprice.type";

interface SelectTicketProps {
  seatType: string; // ghế được chọn từ booking, mặc định là NORMAL
  onTicketChange: (tickets: Record<string, number>) => void;
}

const TICKET_LABELS: Record<string, string> = {
  ADULT: "Người lớn",
  CHILD: "Trẻ em",
  STUDENT: "Học sinh/Sinh viên",
};

const SelectTicket: React.FC<SelectTicketProps> = ({ seatType, onTicketChange }) => {
  const [tickets, setTickets] = useState<SeatPriceResponse[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const allPrices = await pricingService.getAllSeatPrices();
        setTickets(allPrices.filter(t => t.seatType === seatType));
      } catch (err) {
        console.error("Không lấy được dữ liệu ticket:", err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [seatType]);

  const handleChange = (ticketType: string, delta: number) => {
    setSelectedTickets(prev => {
      const newCount = Math.max((prev[ticketType] || 0) + delta, 0);
      const updated = { ...prev, [ticketType]: newCount };
      onTicketChange(updated);
      return updated;
    });
  };

  if (loading) return <p className="text-white text-center mt-6">Đang tải loại vé...</p>;
  if (!tickets.length) return <p className="text-white text-center mt-6">Loại vé không tồn tại.</p>;

  return (
    <div className="flex gap-4 flex-wrap justify-center">
      {tickets.map(ticket => (
        <div key={`${ticket.seatType}-${ticket.ticketType}`} 
             className="border border-yellow-100/80 bg-zinc-900/40 p-4 rounded-xl w-48 shadow-md flex flex-col items-center">
          <div className="font-bold text-lg text-white mb-2">{TICKET_LABELS[ticket.ticketType] || ticket.ticketType}</div>
          <div className="text-yellow-400 font-semibold mb-3">{Number(ticket.basePrice).toLocaleString()} VNĐ</div>
          <div className="flex gap-2 mt-auto mb-2 justify-center items-center">
            <button  
              className="px-2 py-1 bg-red-600 rounded text-white"
              onClick={() => handleChange(ticket.ticketType, -1)}>-</button>
            <span className="text-white">{selectedTickets[ticket.ticketType] || 0}</span>
            <button 
              className="px-2 py-1 bg-green-600 rounded text-white"
              onClick={() => handleChange(ticket.ticketType, 1)}>+</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SelectTicket;
