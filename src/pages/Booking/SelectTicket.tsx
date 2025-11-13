import React, { useState } from "react";

export interface TicketType {
  id: string;
  name: string;
  price: number;
  type: "ĐƠN" | "ĐÔI";
}

interface SelectTicketProps {
  onTicketChange: (tickets: Record<string, number>) => void;
}

const MOCK_TICKETS: TicketType[] = [
  { id: "t1", name: "Người lớn", price: 69000, type: "ĐƠN" },
  { id: "t2", name: "HSSV-U22-GV", price: 49000, type: "ĐƠN" },
  { id: "t3", name: "Người bản địa/Người cao tuổi", price: 49000, type: "ĐƠN" },
  { id: "t4", name: "Người lớn", price: 148000, type: "ĐÔI" },
];

const SelectTicket: React.FC<SelectTicketProps> = ({ onTicketChange }) => {
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});

  const handleChange = (id: string, delta: number) => {
    setSelectedTickets((prev) => {
      const newCount = Math.max((prev[id] || 0) + delta, 0);
      const updated = { ...prev, [id]: newCount };
      onTicketChange(updated);
      return updated;
    });
  };

  return (
    <div className="flex gap-4 flex-wrap justify-center">
      {MOCK_TICKETS.map((ticket) => (
        <div key={ticket.id} className="border border-yellow-100/80 p-4 rounded-md w-48">
          <div className="font-bold text-white">{ticket.name}</div>
          <div className="text-yellow-400 font-semibold">{ticket.price.toLocaleString()} VNĐ</div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => handleChange(ticket.id, -1)}>-</button>
            <span className="text-white">{selectedTickets[ticket.id] || 0}</span>
            <button onClick={() => handleChange(ticket.id, 1)}>+</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SelectTicket;
