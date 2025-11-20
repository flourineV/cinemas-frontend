import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

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
          bg-transparent text-white border border-yellow-300/90 font-semibold outline-none
          focus:border-yellow-300 focus:ring-2 focus:ring-yellow-400/30
          backdrop-blur-sm hover:bg-white/5 transition-shadow
          shadow-[0_6px_14px_rgba(0,0,0,0.45)]
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
            bg-black/40 backdrop-blur-xl border border-yellow-400/40
            shadow-[0_0_15px_rgba(255,200,0,0.25)]
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
                  ${isHighlighted ? "bg-yellow-400/20" : ""} ${isSelected ? "font-semibold text-yellow-300" : ""}`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check size={16} className="text-yellow-400" />}
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
  const [selectedCinema, setSelectedCinema] = useState("");
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const cinemas: Option[] = [
    { value: "galaxy", label: "Rạp Galaxy" },
    { value: "cgv", label: "Rạp CGV" },
    { value: "lotte", label: "Lotte Cinema" },
  ];
  const moviesForCinema: Record<string, Option[]> = {
    galaxy: [
      { value: "endgame", label: "Avengers: Endgame" },
      { value: "frozen", label: "Frozen II" },
      { value: "oppenheimer", label: "Oppenheimer" },
    ],
    cgv: [
      { value: "oppenheimer", label: "Oppenheimer" },
      { value: "tenet", label: "Tenet" },
      { value: "matrix", label: "The Matrix" },
    ],
    lotte: [
      { value: "inception", label: "Inception" },
      { value: "dune", label: "Dune" },
    ],
  };
  const dates: Option[] = [
    { value: "2025-09-20", label: "20/09/2025" },
    { value: "2025-09-21", label: "21/09/2025" },
    { value: "2025-09-22", label: "22/09/2025" },
  ];
  const times: Option[] = [
    { value: "10:00", label: "10:00" },
    { value: "13:00", label: "13:00" },
    { value: "19:30", label: "19:30" },
  ];

  const movieOptions = selectedCinema
    ? (moviesForCinema[selectedCinema] ?? [])
    : [];

  return (
    <div
      className="relative w-full bg-gradient-to-r from-[#3a0d0d] via-[#4a1a1a] to-[#3a0d0d]
                    shadow-[0_0_25px_rgba(255,0,0,0.3)]
                    border border-yellow-700 px-6 py-6 overflow-visible"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 via-yellow-700/5 to-transparent pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center gap-5 w-full relative z-10">
        <h2 className="text-2xl font-extrabold text-yellow-400 whitespace-nowrap drop-shadow-[0_0_10px_rgba(255,200,0,0.4)]">
          ĐẶT VÉ NHANH
        </h2>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CustomSelect
            options={cinemas}
            value={selectedCinema}
            onChange={(v) => {
              setSelectedCinema(v);
              setSelectedMovie("");
              setSelectedDate("");
              setSelectedTime("");
            }}
            placeholder="Rạp"
          />

          <CustomSelect
            options={movieOptions}
            value={selectedMovie}
            onChange={(v) => {
              setSelectedMovie(v);
              setSelectedDate("");
              setSelectedTime("");
            }}
            placeholder="Phim"
            disabled={!selectedCinema}
          />

          <CustomSelect
            options={dates}
            value={selectedDate}
            onChange={(v) => {
              setSelectedDate(v);
              setSelectedTime("");
            }}
            placeholder="Ngày"
            disabled={!selectedMovie}
          />

          <CustomSelect
            options={times}
            value={selectedTime}
            onChange={setSelectedTime}
            placeholder="Suất"
            disabled={!selectedDate}
          />
        </div>

        <button
          disabled={!selectedTime}
          className="relative overflow-hidden px-10 py-3 rounded-lg font-extrabold text-white 
                     text-lg shadow-[0_0_15px_rgba(255,0,0,0.4)] 
                     transition-all duration-500 ease-out disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={() => {
            alert(
              `Đặt: ${selectedCinema} | ${selectedMovie} | ${selectedDate} | ${selectedTime}`
            );
          }}
        >
          <span className="relative z-10">ĐẶT NGAY</span>
          <div
            className="absolute inset-0 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 
                       bg-[length:200%_100%] animate-gradientMove rounded-lg opacity-90"
          />
        </button>
      </div>
    </div>
  );
};

export default QuickBookingBar;
