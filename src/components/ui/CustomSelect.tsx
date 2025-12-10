import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useOutsideClick } from "@/hooks/useOutsideClick";

interface SelectOption {
  value: string;
  label: string;
}

type Variant = "dark" | "light" | "gold" | "outline" | "glass";

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
  variant?: Variant;
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
  variant = "dark",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick(selectRef, () => setIsOpen(false), isOpen);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label ?? placeholder;

  const positionClasses =
    dropdownPosition === "top" ? "bottom-full mb-2" : "mt-2";

  // === BUTTON STYLES ===
  const buttonStyles =
    variant === "light"
      ? "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
      : variant === "gold"
        ? "bg-black border-yellow-400 text-yellow-300"
        : variant === "outline"
          ? "bg-transparent border-2 border-zinc-600 text-zinc-700 hover:bg-zinc-100"
          : variant === "glass"
            ? "backdrop-blur-md bg-white/20 border-white/30 text-white shadow-lg hover:bg-white/30"
            : "bg-transparent border-zinc-800 text-zinc-800"; // dark mặc định

  // === DROPDOWN STYLES ===
  const dropdownStyles =
    variant === "light"
      ? "bg-white border-gray-300"
      : variant === "gold"
        ? "bg-black border-yellow-400 text-yellow-200"
        : variant === "outline"
          ? "bg-white border-zinc-600"
          : variant === "glass"
            ? "backdrop-blur-xl bg-white/10 border-white/40 text-white"
            : "bg-white border-zinc-800";

  // === OPTION STYLES ===
  const optionStyles = (isSelected: boolean) => {
    if (variant === "gold") {
      return isSelected
        ? "bg-yellow-500 text-black font-semibold"
        : "text-yellow-200 hover:bg-yellow-400 hover:text-black";
    }

    if (variant === "outline") {
      return isSelected
        ? "bg-zinc-200 text-black font-semibold"
        : "text-zinc-700 hover:bg-zinc-100";
    }

    if (variant === "glass") {
      return isSelected
        ? "bg-white/30 text-black font-semibold"
        : "text-white hover:bg-white/20";
    }

    // Giữ nguyên logic dark/light
    return variant === "light"
      ? isSelected
        ? "text-yellow-600 bg-gray-100 font-semibold"
        : "text-gray-700 hover:bg-yellow-500 hover:text-white"
      : isSelected
        ? "text-yellow-300 bg-black/50 font-semibold"
        : "text-yellow-100/80 hover:bg-yellow-300 hover:text-black";
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        onClick={() => !disabled && setIsOpen((s) => !s)}
        disabled={disabled}
        className={`flex items-center justify-between w-full px-5 py-3 text-base font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${buttonStyles} ${buttonClassName}`}
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
          className={`absolute right-0 w-full rounded-md shadow-lg border z-20 animate-fadeIn max-h-60 overflow-y-auto ${positionClasses} ${dropdownStyles} ${dropdownClassName}`}
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-5 py-3 text-base transition-colors ${optionStyles(
                  value === option.value
                )}`}
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
