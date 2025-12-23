import { useEffect, useState } from "react";
import { provinceService } from "../../services/showtime/provinceService";
import { theaterService } from "../../services/showtime/theaterService";
import { useLanguage } from "@/contexts/LanguageContext";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import "dayjs/locale/en";

interface TheaterSelectionProps {
  movie?: { id: string; title: string };
}

export default function TheaterSelection({ movie }: TheaterSelectionProps) {
  const { t, language } = useLanguage();
  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("");

  const [theaters, setTheaters] = useState<any[]>([]);
  const [showtimes] = useState<any[]>([]);

  const [days, setDays] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const today = new Date();
    setDays(
      [0, 1, 2].map((i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return d;
      })
    );
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      const res = await provinceService.getAllProvinces();
      setProvinces(res);
      if (res.length > 0) setSelectedProvinceId(res[0].id);
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!selectedProvinceId) return;
    const fetchTheaters = async () => {
      const res =
        await theaterService.getTheatersByProvince(selectedProvinceId);
      setTheaters(res);
    };
    fetchTheaters();
  }, [selectedProvinceId]);

  useEffect(() => {
    if (!selectedProvinceId || !selectedDate || !movie) return;
    // Placeholder for future showtime fetching
  }, [selectedProvinceId, selectedDate, movie]);

  return (
    <div className="w-full bg-gradient-to-b from-[#1a1446] to-[#000015] py-10 rounded-2xl text-white">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-yellow-400 tracking-widest">
        {t("showtime.title")}
      </h1>

      {/* --- Date Selection --- */}
      <div className="flex justify-center gap-4 mb-8">
        {days.map((d) => {
          const isSelected = d.toDateString() === selectedDate.toDateString();
          return (
            <button
              key={d.toISOString()}
              onClick={() => setSelectedDate(d)}
              className={`w-24 text-center rounded-md border-2 py-3 font-semibold transition-all ${
                isSelected
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "border-yellow-400 text-yellow-300 hover:bg-yellow-300 hover:text-black"
              }`}
            >
              <div>{dayjs(d).format("DD/MM")}</div>
              <div className="text-sm">
                {dayjs(d).locale(language).format("dddd")}
              </div>
            </button>
          );
        })}
      </div>

      {/* --- Province Dropdown --- */}
      <div className="flex justify-center mb-10">
        <select
          value={selectedProvinceId}
          onChange={(e) => setSelectedProvinceId(e.target.value)}
          className="border border-yellow-400 text-yellow-300 bg-transparent px-4 py-2 rounded-md font-semibold"
        >
          {provinces.map((p) => (
            <option
              key={p.id}
              value={p.id}
              className="bg-[#1a1446] text-yellow-300"
            >
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* --- Theater List --- */}
      <div className="max-w-5xl mx-auto space-y-6 px-4">
        {theaters.map((theater) => {
          const theaterShowtimes = showtimes.filter(
            (st) => st.theaterId === theater.id
          );
          if (theaterShowtimes.length === 0) return null;

          return (
            <div
              key={theater.id}
              className="bg-purple-700 rounded-xl p-6 shadow-lg border-2 border-purple-500"
            >
              <h2 className="text-xl font-bold text-yellow-300 mb-2">
                {theater.name} ({theater.provinceName})
              </h2>
              <p className="text-sm text-gray-200 mb-4">{theater.address}</p>

              {Object.entries(
                theaterShowtimes.reduce((acc: any, st) => {
                  acc[st.roomType] = acc[st.roomType] || [];
                  acc[st.roomType].push(st);
                  return acc;
                }, {})
              ).map(([type, times]: any) => (
                <div key={type} className="mb-4">
                  <h3 className="font-semibold mb-2 text-white">{type}</h3>
                  <div className="flex flex-wrap gap-2">
                    {times.map((st: any) => (
                      <button
                        key={st.id}
                        className="border border-white rounded-md px-3 py-1 hover:bg-yellow-300 hover:text-black transition"
                      >
                        {st.startTime}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
