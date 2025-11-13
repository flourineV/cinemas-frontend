import React, { useState } from "react";
import SelectTicket from "./SelectTicket";
import SelectSeat from "./SelectSeat";
import SelectCombo from "./SelectCombo";

export const BookingStep: React.FC = () => {
  const [tickets, setTickets] = useState({});
  const [seats, setSeats] = useState<string[]>([]);
  const [combos, setCombos] = useState({});

  return (
    <div className="p-6">
      <h2 className="text-4xl font-extrabold mb-10 mt-20 text-center text-white">
        CHỌN LOẠI VÉ
      </h2>
      <SelectTicket onTicketChange={setTickets} />

      <h2 className="text-4xl font-extrabold mb-10 mt-20 text-center text-white">
        CHỌN GHẾ
      </h2>
      <SelectSeat onSeatSelect={setSeats} />

      <h2 className="text-4xl font-extrabold mb-10 mt-20 text-center text-white">
        CHỌN BẮP NƯỚC
      </h2>
      <SelectCombo onComboSelect={setCombos} />
    </div>
  );
};
