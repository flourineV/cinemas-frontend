"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

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
}

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = () => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    // Dropdown rộng hơn một chút, né ra 8px top
    const desiredWidth = Math.max(rect.width + 160, 160); // nếu muốn rộng hơn cha
    // clamp left trong viewport
    let left = rect.left + window.scrollX;
    const maxLeft = window.scrollX + window.innerWidth - desiredWidth - 8;
    if (left > maxLeft) left = Math.max(window.scrollX + 8, maxLeft);

    setPosition({
      top: rect.bottom + window.scrollY + 8,
      left,
      width: desiredWidth,
    });
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setIsOpen(false);
    };
    const handleClose = () => setIsOpen(false);

    window.addEventListener("click", handleClickOutside);
    window.addEventListener("resize", handleClose);
    window.addEventListener("scroll", handleClose, true);
    return () => {
      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("resize", handleClose);
      window.removeEventListener("scroll", handleClose, true);
    };
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <button
        onClick={toggleDropdown}
        disabled={disabled}
        className="flex justify-between items-center w-full px-3 py-2 text-sm font-medium bg-black/40 border border-yellow-400/40 rounded-lg text-white hover:bg-black/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* very important: truncate here so long label không bung ô */}
        <span className="truncate block">
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            className="absolute bg-black/60 backdrop-blur-md border border-yellow-400/40 rounded-md shadow-lg z-50 overflow-hidden"
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
              minWidth: 160,
            }}
            role="listbox"
          >
            <div className="py-1 animate-fadeIn">
              {options.map((o) => (
                <div
                  key={o.value}
                  className={`px-4 py-2 cursor-pointer text-sm transition-colors truncate ${
                    value === o.value
                      ? "text-yellow-300 bg-black/50 font-semibold"
                      : "text-yellow-100/80 hover:bg-yellow-300 hover:text-black"
                  }`}
                  onClick={() => {
                    onChange(o.value);
                    setIsOpen(false);
                  }}
                  title={o.label}
                >
                  {o.label}
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
