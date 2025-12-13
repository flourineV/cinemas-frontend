import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { movieService } from "@/services/movie/movieService";
import { theaterService } from "@/services/showtime/theaterService";
import type { MovieSummary } from "@/types/movie/movie.type";
import type { TheaterResponse } from "@/types/showtime/theater.type";

/* ---------------- CustomSelect (dropdown xổ xuống) ---------------- */
type Option = { value: string; label: string };

function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [anim, setAnim] = useState(false);
  const [highlight, setHighlight] = useState<number>(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) handleClose();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  function handleOpen() {
    if (disabled) return;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpen(true);
    requestAnimationFrame(() => setAnim(true));
  }

  function handleClose() {
    setAnim(false);
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
      setHighlight(-1);
    }, 180);
  }

  function toggle() {
    if (disabled) return;
    if (!open) handleOpen();
    else handleClose();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) handleOpen();
      setHighlight((h) => Math.min(h + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) handleOpen();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) {
        handleOpen();
        const idx = options.findIndex((o) => o.value === value);
        setHighlight(idx >= 0 ? idx : 0);
      } else {
        if (highlight >= 0 && highlight < options.length) {
          onChange(options[highlight].value);
        }
        handleClose();
      }
    } else if (e.key === "Escape") handleClose();
  }

  useEffect(() => {
    if (!listRef.current || highlight < 0) return;
    const el = listRef.current.children[highlight] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  const currentLabel =
    options.find((o) => o.value === value)?.label ?? placeholder ?? "";

  return (
    <div
      ref={rootRef}
      className={`relative w-full select-none ${disabled ? "opacity-50" : ""}`}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onKeyDown={onKeyDown}
        onClick={toggle}
        disabled={disabled}
        className="
          w-full text-left px-4 py-3 pr-12 rounded-lg h-12 leading-tight
          bg-white/10 text-white border border-gray-600 font-semibold outline-none
          focus:border-white focus:ring-2 focus:ring-white/30
          backdrop-blur-sm hover:bg-white/20 transition-all
          shadow-[0_30px_60px_rgba(0,0,0,0.7)]
        "
      >
        <span className="truncate block">{currentLabel}</span>
        <ChevronDown
          size={18}
          className={`absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none transition-transform duration-200 ${
            open && anim ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-activedescendant={
            highlight >= 0
              ? `opt-${highlight}-${options[highlight].value}`
              : undefined
          }
          tabIndex={-1}
          className={`
            absolute z-50 left-0 top-full mt-2 min-w-full max-h-56 overflow-auto
            bg-black/95 backdrop-blur-xl border border-gray-700
            shadow-[0_8px_24px_rgba(0,0,0,0.5)]
            rounded-lg
            transform origin-top transition-all duration-180 ease-out
            ${anim ? "scale-100 opacity-100" : "scale-95 opacity-0"}
          `}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isHighlighted = idx === highlight;
            return (
              <li
                id={`opt-${idx}-${opt.value}`}
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlight(idx)}
                onMouseLeave={() => setHighlight(-1)}
                onClick={() => {
                  onChange(opt.value);
                  handleClose();
                }}
                className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors text-white
                  ${isHighlighted ? "bg-white/20" : ""} ${isSelected ? "font-semibold" : ""}`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check size={16} className="text-white" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ---------------- QuickBookingBar ---------------- */

const QuickBookingBar: React.FC = () => {
  const navigate = useNavigate();

  // State for selections
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedTheater, setSelectedTheater] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedShowtime, setSelectedShowtime] = useState("");

  // State for API data
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [theaters, setTheaters] = useState<TheaterResponse[]>([]);
  const [availableDates, setAvailableDates] = useState<Option[]>([]);
  const [showtimes, setShowtimes] = useState<Option[]>([]);

  // Loading states
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingTheaters, setLoadingTheaters] = useState(false);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);

  // Convert API data to options
  const movieOptions: Option[] = movies.map((movie) => ({
    value: movie.id,
    label: movie.title,
  }));

  const theaterOptions: Option[] = theaters.map((theater) => ({
    value: theater.id,
    label: theater.name,
  }));

  // Generate next 7 days for date selection
  const generateDateOptions = (): Option[] => {
    const dates: Option[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
      const displayStr = date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      dates.push({
        value: dateStr,
        label: displayStr,
      });
    }

    return dates;
  };

  // Load movies on component mount
  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoadingMovies(true);
        const response = await movieService.getNowPlaying(0, 50);
        setMovies(response.content);
      } catch (error) {
        console.error("Error loading movies:", error);
      } finally {
        setLoadingMovies(false);
      }
    };

    loadMovies();
    setAvailableDates(generateDateOptions());
  }, []);

  // Load theaters when movie is selected
  useEffect(() => {
    if (!selectedMovie) {
      setTheaters([]);
      return;
    }

    const loadTheaters = async () => {
      try {
        setLoadingTheaters(true);
        const allTheaters = await theaterService.getAllTheaters();
        setTheaters(allTheaters);
      } catch (error) {
        console.error("Error loading theaters:", error);
      } finally {
        setLoadingTheaters(false);
      }
    };

    loadTheaters();
  }, [selectedMovie]);

  // Load showtimes when movie, theater and date are selected
  useEffect(() => {
    if (!selectedMovie || !selectedTheater || !selectedDate) {
      setShowtimes([]);
      return;
    }

    const loadShowtimes = async () => {
      try {
        setLoadingShowtimes(true);
        const moviesWithTheaters = await theaterService.getMoviesWithTheaters(
          selectedDate,
          selectedMovie,
          selectedTheater
        );

        const showtimeOptions: Option[] = [];

        moviesWithTheaters.forEach((movieData) => {
          movieData.theaters.forEach((theater) => {
            if (theater.theaterId === selectedTheater) {
              theater.showtimes.forEach((showtime) => {
                const startTime = new Date(showtime.startTime);
                const timeStr = startTime.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });

                showtimeOptions.push({
                  value: showtime.showtimeId,
                  label: timeStr,
                });
              });
            }
          });
        });

        setShowtimes(showtimeOptions);
      } catch (error) {
        console.error("Error loading showtimes:", error);
      } finally {
        setLoadingShowtimes(false);
      }
    };

    loadShowtimes();
  }, [selectedMovie, selectedTheater, selectedDate]);

  return (
    <div
      className="relative w-full bg-black/90
                    shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                    border border-gray-700 px-6 py-6 overflow-visible backdrop-blur-md rounded-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 pointer-events-none rounded-xl" />

      <div className="flex flex-col lg:flex-row items-center gap-5 w-full relative z-10">
        <h2 className="text-2xl font-extrabold text-white whitespace-nowrap">
          ĐẶT VÉ NHANH
        </h2>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CustomSelect
            options={movieOptions}
            value={selectedMovie}
            onChange={(v) => {
              setSelectedMovie(v);
              setSelectedTheater("");
              setSelectedDate("");
              setSelectedShowtime("");
            }}
            placeholder={loadingMovies ? "Đang tải phim..." : "Chọn phim"}
            disabled={loadingMovies}
          />

          <CustomSelect
            options={theaterOptions}
            value={selectedTheater}
            onChange={(v) => {
              setSelectedTheater(v);
              setSelectedDate("");
              setSelectedShowtime("");
            }}
            placeholder={loadingTheaters ? "Đang tải rạp..." : "Chọn rạp"}
            disabled={!selectedMovie || loadingTheaters}
          />

          <CustomSelect
            options={availableDates}
            value={selectedDate}
            onChange={(v) => {
              setSelectedDate(v);
              setSelectedShowtime("");
            }}
            placeholder="Chọn ngày"
            disabled={!selectedTheater}
          />

          <CustomSelect
            options={showtimes}
            value={selectedShowtime}
            onChange={setSelectedShowtime}
            placeholder={loadingShowtimes ? "Đang tải suất..." : "Chọn suất"}
            disabled={!selectedDate || loadingShowtimes}
          />
        </div>

        <button
          disabled={!selectedShowtime}
          className="relative overflow-hidden px-10 py-3 rounded-lg font-extrabold text-black 
                     text-lg shadow-[0_0_20px_rgba(251,146,60,0.6)] 
                     transition-all duration-500 ease-out disabled:opacity-50 disabled:cursor-default
                     hover:scale-105 hover:shadow-[0_0_30px_rgba(251,146,60,0.8)]"
          onClick={() => {
            if (selectedShowtime) {
              // Navigate to seat selection page with showtime ID
              navigate(`/booking/seats/${selectedShowtime}`);
            }
          }}
        >
          <span className="relative z-10 drop-shadow-sm">ĐẶT NGAY</span>
          <div
            className="absolute inset-0 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 
                       bg-[length:200%_100%] animate-gradientMove rounded-lg"
          />
        </button>
      </div>
    </div>
  );
};

export default QuickBookingBar;
