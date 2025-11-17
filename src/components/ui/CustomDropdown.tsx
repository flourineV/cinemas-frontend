import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useOutsideClick } from "@/hooks/useOutsideClick";

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dropdownPosition?: "bottom" | "top";
}

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  className = "",
  dropdownPosition = "bottom",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick(dropdownRef, () => setIsOpen(false), isOpen);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label ?? placeholder;

  const positionClasses =
    dropdownPosition === "top" ? "bottom-full mb-2" : "mt-2";

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen((s) => !s)}
        disabled={disabled}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium bg-black/40 border border-yellow-400/40 rounded-lg text-white hover:bg-black/50 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>{displayText}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div
          className={`absolute right-0 w-48 rounded-md shadow-lg bg-black/60 backdrop-blur-md border border-yellow-400/40 z-20 animate-fadeIn ${positionClasses}`}
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
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
