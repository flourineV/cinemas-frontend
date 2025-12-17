import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export type SelectOption = { value: string; label: string };

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "glass" | "solid";
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  className = "",
  variant = "default",
}) => {
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

  // Variant styles
  const getButtonStyles = () => {
    const baseStyles = `
      w-full text-left px-4 py-3 pr-12 rounded-lg h-12 leading-tight
      font-semibold outline-none transition-all select-none
      focus:ring-2 focus:ring-offset-2
    `;

    switch (variant) {
      case "glass":
        return `${baseStyles}
          bg-white/10 text-white border border-gray-600
          focus:border-white focus:ring-white/30
          backdrop-blur-sm hover:bg-white/20
          shadow-[0_30px_60px_rgba(0,0,0,0.7)]
        `;
      case "solid":
        return `${baseStyles}
          bg-white text-gray-900 border border-gray-300
          focus:border-yellow-500 focus:ring-yellow-500/30
          hover:border-gray-400 shadow-sm
        `;
      default:
        return `${baseStyles}
          bg-white text-gray-900 border border-gray-300
          focus:border-blue-500 focus:ring-blue-500/30
          hover:border-gray-400 shadow-sm
        `;
    }
  };

  const getDropdownStyles = () => {
    const baseStyles = `
      absolute z-50 left-0 top-full mt-2 min-w-full max-h-56 overflow-auto
      border shadow-lg rounded-lg
      transform origin-top transition-all duration-180 ease-out
    `;

    switch (variant) {
      case "glass":
        return `${baseStyles}
          bg-black/95 backdrop-blur-xl border-gray-700
          shadow-[0_8px_24px_rgba(0,0,0,0.5)]
        `;
      default:
        return `${baseStyles}
          bg-white border-gray-200
          shadow-[0_8px_24px_rgba(0,0,0,0.15)]
        `;
    }
  };

  const getOptionStyles = (isSelected: boolean, isHighlighted: boolean) => {
    const baseStyles =
      "px-4 py-3 cursor-pointer flex items-center justify-between transition-colors";

    switch (variant) {
      case "glass":
        return `${baseStyles} text-white
          ${isHighlighted ? "bg-white/20" : ""} 
          ${isSelected ? "font-semibold" : ""}
        `;
      default:
        return `${baseStyles} text-gray-900
          ${isHighlighted ? "bg-gray-100" : ""} 
          ${isSelected ? "font-semibold bg-blue-50" : ""}
        `;
    }
  };

  const getChevronColor = () => {
    switch (variant) {
      case "glass":
        return "text-white";
      default:
        return "text-gray-500";
    }
  };

  const getCheckColor = () => {
    switch (variant) {
      case "glass":
        return "text-white";
      default:
        return "text-blue-500";
    }
  };

  return (
    <div
      ref={rootRef}
      className={`relative w-full select-none ${disabled ? "opacity-50" : ""} ${className}`}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onKeyDown={onKeyDown}
        onClick={toggle}
        disabled={disabled}
        className={getButtonStyles()}
      >
        <span className="truncate block">{currentLabel}</span>
        <ChevronDown
          size={18}
          className={`absolute right-4 top-1/2 -translate-y-1/2 ${getChevronColor()} pointer-events-none transition-transform duration-200 ${
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
          className={`${getDropdownStyles()} ${
            anim ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
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
                className={getOptionStyles(isSelected, isHighlighted)}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check size={16} className={getCheckColor()} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
