// QuickBookingBar.tsx
import { useState } from "react";
import AnimatedButton from "./AnimatedButton"; 
// Đảm bảo import StyledSelect từ đường dẫn chính xác
import StyledSelect from "./StyledSelect"; 

const cinemaOptions = [
    { label: "1. Chọn Rạp", value: "", disabled: true },
    { label: "Rạp Galaxy", value: "galaxy" },
    { label: "Rạp CGV", value: "cgv" },
    { label: "Lotte Cinema", value: "lotte" },
];

const movieOptions = [
    { label: "2. Chọn Phim", value: "", disabled: true },
    { label: "Avengers: Endgame", value: "endgame" },
    { label: "Frozen II", value: "frozen" },
    { label: "Oppenheimer", value: "oppenheimer" },
];

const dateOptions = [
    { label: "3. Chọn Ngày", value: "", disabled: true },
    { label: "20/09/2025", value: "2025-09-20" },
    { label: "21/09/2025", value: "2025-09-21" },
    { label: "22/09/2025", value: "2025-09-22" },
];

const timeOptions = [
    { label: "4. Chọn Suất", value: "", disabled: true },
    { label: "10:00", value: "10:00" },
    { label: "13:00", value: "13:00" },
    { label: "19:30", value: "19:30" },
];

const QuickBookingBar = () => {
    const [selectedCinema, setSelectedCinema] = useState("");
    const [selectedMovie, setSelectedMovie] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");

    // Hàm xử lý đặt vé (Giữ nguyên)
    const handleBooking = () => {
        if (selectedTime) {
            alert(`Đang đặt vé cho: ${selectedMovie} tại ${selectedCinema} vào ngày ${selectedDate} lúc ${selectedTime}`);
        }
    };

    return (
        <div className="w-full rounded-lg shadow-2xl px-6 py-4
                        bg-white/10 backdrop-blur-lg border border-gray-500">
            <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
                {/* Title (Giữ nguyên) */}
                <h2 className="text-xl text-yellow-400 font-bold whitespace-nowrap">
                    ĐẶT VÉ NHANH
                </h2>

                {/* Dropdowns sử dụng StyledSelect */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <StyledSelect
                        label="Chọn Rạp"
                        options={cinemaOptions}
                        value={selectedCinema}
                        onChange={setSelectedCinema}
                        disabled={false}
                        stepNumber={1}
                    />

                    <StyledSelect
                        label="Chọn Phim"
                        options={movieOptions}
                        value={selectedMovie}
                        onChange={setSelectedMovie}
                        disabled={!selectedCinema}
                        stepNumber={2}
                    />

                    <StyledSelect
                        label="Chọn Ngày"
                        options={dateOptions}
                        value={selectedDate}
                        onChange={setSelectedDate}
                        disabled={!selectedMovie}
                        stepNumber={3}
                    />

                    <StyledSelect
                        label="Chọn Suất"
                        options={timeOptions}
                        value={selectedTime}
                        onChange={setSelectedTime}
                        disabled={!selectedDate}
                        stepNumber={4}
                    />
                </div>

                {/* AnimatedButton (Giữ nguyên) */}
                <AnimatedButton 
                    onClick={handleBooking} 
                    disabled={!selectedTime}
                    variant="yellow-to-orange" 
                    className="whitespace-nowrap w-full lg:w-auto" 
                >
                    ĐẶT NGAY
                </AnimatedButton>
            </div>
        </div>
    );
};

export default QuickBookingBar;