import { useState } from "react";
import { ChevronDown } from "lucide-react";

const QuickBookingBar = () => {
  const [selectedCinema, setSelectedCinema] = useState("");
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  return (
    <div
      className="relative w-full bg-gradient-to-r from-[#3a0d0d] via-[#4a1a1a] to-[#3a0d0d]
                 rounded-2xl shadow-[0_0_25px_rgba(255,0,0,0.3)] 
                 border border-red-700/40 px-6 py-6 overflow-hidden"
    >
      {/* Hiệu ứng sáng nền nhẹ */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 via-yellow-700/5 to-transparent pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center gap-5 w-full relative z-10">
        {/* Title */}
        <h2 className="text-2xl font-extrabold text-yellow-400 whitespace-nowrap drop-shadow-[0_0_10px_rgba(255,200,0,0.4)]">
          ĐẶT VÉ NHANH
        </h2>

        {/* Dropdowns */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* --- Chọn Rạp --- */}
          <div className="relative">
            <select
              value={selectedCinema}
              onChange={(e) => setSelectedCinema(e.target.value)}
              className="w-full appearance-none px-4 py-3 pr-10 rounded-lg bg-[#181818] text-white border border-gray-500/70 
                         font-semibold focus:border-red-500 focus:ring-2 focus:ring-red-500/60 
                         outline-none transition shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]"
            >
              <option value="" disabled>
                1. Chọn Rạp
              </option>
              <option value="galaxy">Rạp Galaxy</option>
              <option value="cgv">Rạp CGV</option>
              <option value="lotte">Lotte Cinema</option>
            </select>

            <ChevronDown
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* --- Chọn Phim --- */}
          <div className="relative">
            <select
              value={selectedMovie}
              onChange={(e) => setSelectedMovie(e.target.value)}
              disabled={!selectedCinema}
              className="w-full appearance-none px-4 py-3 pr-10 rounded-lg bg-[#181818] text-white border border-gray-500/70 
                         font-semibold focus:border-red-500 focus:ring-2 focus:ring-red-500/60 outline-none 
                         transition shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] 
                         disabled:bg-[#2a2a2a] disabled:text-gray-500"
            >
              <option value="" disabled>
                2. Chọn Phim
              </option>
              <option value="endgame">Avengers: Endgame</option>
              <option value="frozen">Frozen II</option>
              <option value="oppenheimer">Oppenheimer</option>
            </select>

            <ChevronDown
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* --- Chọn Ngày --- */}
          <div className="relative">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={!selectedMovie}
              className="w-full appearance-none px-4 py-3 pr-10 rounded-lg bg-[#181818] text-white border border-gray-500/70 
                         font-semibold focus:border-red-500 focus:ring-2 focus:ring-red-500/60 outline-none 
                         transition shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] 
                         disabled:bg-[#2a2a2a] disabled:text-gray-500"
            >
              <option value="" disabled>
                3. Chọn Ngày
              </option>
              <option value="2025-09-20">20/09/2025</option>
              <option value="2025-09-21">21/09/2025</option>
              <option value="2025-09-22">22/09/2025</option>
            </select>

            <ChevronDown
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* --- Chọn Suất --- */}
          <div className="relative">
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              disabled={!selectedDate}
              className="w-full appearance-none px-4 py-3 pr-10 rounded-lg bg-[#181818] text-white border border-gray-500/70 
                         font-semibold focus:border-red-500 focus:ring-2 focus:ring-red-500/60 outline-none 
                         transition shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] 
                         disabled:bg-[#2a2a2a] disabled:text-gray-500"
            >
              <option value="" disabled>
                4. Chọn Suất
              </option>
              <option value="10:00">10:00</option>
              <option value="13:00">13:00</option>
              <option value="19:30">19:30</option>
            </select>

            <ChevronDown
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Button */}
        <button
            disabled={!selectedTime}
            className="relative overflow-hidden px-10 py-3 rounded-lg font-extrabold text-white 
                        text-lg shadow-[0_0_15px_rgba(255,0,0,0.4)] 
                        transition-all duration-500 ease-out 
                        disabled:bg-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed"
            >
            <span className="relative z-10">ĐẶT NGAY</span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 
                            bg-[length:200%_100%] animate-gradientMove rounded-lg opacity-90
                            group-hover:opacity-100" />
        </button>

      </div>
    </div>
  );
};

export default QuickBookingBar;
