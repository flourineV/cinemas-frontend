import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useOutsideClick } from "@/hooks/useOutsideClick";

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  dropdownPosition?: "bottom" | "top";
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Chọn...",
  disabled = false,
  className = "",
  buttonClassName = "",
  dropdownClassName = "",
  dropdownPosition = "bottom",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick(selectRef, () => setIsOpen(false), isOpen);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label ?? placeholder;

  const positionClasses =
    dropdownPosition === "top" ? "bottom-full mb-2" : "mt-2";

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        onClick={() => !disabled && setIsOpen((s) => !s)}
        disabled={disabled}
        className={`flex items-center justify-between w-full px-5 py-3 text-base font-medium bg-black/40 border border-yellow-400/40 rounded-lg text-white hover:bg-black/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${buttonClassName}`}
      >
        <span>{displayText}</span>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div
          className={`absolute right-0 w-full rounded-md shadow-lg bg-black/60 backdrop-blur-md border border-yellow-400/40 z-20 animate-fadeIn max-h-60 overflow-y-auto ${positionClasses} ${dropdownClassName}`}
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-5 py-3 text-base transition-colors ${
                  value === option.value
                    ? "text-yellow-300 bg-black/50 font-semibold"
                    : "text-yellow-100/80 hover:bg-yellow-300 hover:text-black"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
