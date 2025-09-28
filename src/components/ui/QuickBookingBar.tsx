import { useState } from "react";

const QuickBookingBar = () => {
  const [selectedCinema, setSelectedCinema] = useState("");
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  return (
    <div className="w-full bg-gradient-to-r from-slate-100 to-slate-200 rounded-sm shadow-md px-6 py-4">
      <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
        {/* Title */}
        <h2 className="text-xl font-extrabold">
          ĐẶT VÉ NHANH
        </h2>

        {/* Dropdowns */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <select 
            value={selectedCinema}
            onChange={(e) => setSelectedCinema(e.target.value)}
            className="w-full px-4 py-2 rounded-md border-2 border-gray-300 
                            font-semibold text-purple-700 bg-white 
                            focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none"
          >
            <option value="" disabled>
              1. Chọn Rạp
            </option>
            <option value="galaxy">Rạp Galaxy</option>
            <option value="cgv">Rạp CGV</option>
            <option value="lotte">Lotte Cinema</option>
          </select>

          <select 
            value={selectedMovie}
            onChange={(e) => setSelectedMovie(e.target.value)}
            disabled={!selectedCinema}
            className="w-full px-4 py-2 rounded-md border-2 border-gray-300 
                            font-semibold text-purple-700 bg-white 
                            focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none
                            disabled:bg-gray-200 disabled:text-gray-500"
          >
            <option value="" disabled>
              2. Chọn Phim
            </option>
            <option value="endgame">Avengers: Endgame</option>
            <option value="frozen">Frozen II</option>
            <option value="oppenheimer">Oppenheimer</option>
          </select>

          <select 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={!selectedMovie}
            className="w-full px-4 py-2 rounded-md border-2 border-gray-300 
                            font-semibold text-purple-700 bg-white 
                            focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none
                            disabled:bg-gray-200 disabled:text-gray-500"
          >
            <option value="" disabled>
              3. Chọn Ngày
            </option>
            <option value="2025-09-20">20/09/2025</option>
            <option value="2025-09-21">21/09/2025</option>
            <option value="2025-09-22">22/09/2025</option>
          </select>

          <select 
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            disabled={!selectedDate}
            className="w-full px-4 py-2 rounded-md border-2 border-gray-300 
                            font-semibold text-purple-700 bg-white 
                            focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none
                            disabled:bg-gray-200 disabled:text-gray-500"
          >
            <option value="" disabled>
              4. Chọn Suất
            </option>
            <option value="10:00">10:00</option>
            <option value="13:00">13:00</option>
            <option value="19:30">19:30</option>
          </select>
        </div>

        {/* Button */}
        <button 
          disabled={!selectedTime}
          className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-6 py-2 rounded-md whitespace-nowrap transition disabled:bg-gray-400 disabled:cursor-not-allowed">
          ĐẶT NGAY
        </button>
      </div>
    </div>
  );
};

export default QuickBookingBar;
