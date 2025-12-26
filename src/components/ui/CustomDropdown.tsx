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
  fullWidth?: boolean;
}

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  className = "",
  dropdownPosition = "bottom",
  fullWidth = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick(dropdownRef, () => setIsOpen(false), isOpen);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label ?? placeholder;

  const positionClasses =
    dropdownPosition === "top" ? "bottom-full mb-2" : "mt-2";

  return (
    <div
      className={`relative ${fullWidth ? "w-full" : ""} ${className}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((s) => !s)}
        disabled={disabled}
        className={`flex items-center justify-between space-x-2 px-3 py-2 text-sm font-medium bg-white border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${fullWidth ? "w-full" : "whitespace-nowrap"}`}
      >
        <span className={fullWidth ? "truncate" : ""}>{displayText}</span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div
          className={`absolute left-0 right-0 ${fullWidth ? "w-full" : "w-48"} rounded-md shadow-lg bg-white border border-gray-400 z-20 animate-fadeIn ${positionClasses} max-h-60 overflow-y-auto`}
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                  value === option.value
                    ? "text-yellow-600 bg-yellow-50 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
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
