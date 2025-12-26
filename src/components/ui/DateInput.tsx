"use client";
import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

interface DateInputProps {
  value: string; // yyyy-mm-dd format
  onChange: (value: string) => void; // yyyy-mm-dd format
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
}

export default function DateInput({
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  disabled = false,
  className = "",
  label,
  required = false,
}: DateInputProps): React.JSX.Element {
  const [displayValue, setDisplayValue] = useState("");

  // Convert yyyy-mm-dd to dd/mm/yyyy for display
  const formatDateForDisplay = (dateStr: string): string => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Convert dd/mm/yyyy to yyyy-mm-dd for value
  const formatDateForValue = (displayStr: string): string => {
    if (!displayStr) return "";
    const parts = displayStr.split("/");
    if (parts.length !== 3) return "";
    const [day, month, year] = parts;

    // Validate parts
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (
      isNaN(dayNum) ||
      isNaN(monthNum) ||
      isNaN(yearNum) ||
      dayNum < 1 ||
      dayNum > 31 ||
      monthNum < 1 ||
      monthNum > 12 ||
      yearNum < 1900 ||
      yearNum > 2100
    ) {
      return "";
    }

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // Update display value when prop value changes
  useEffect(() => {
    setDisplayValue(formatDateForDisplay(value));
  }, [value]);

  // Handle input change with formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^\d]/g, ""); // Only numbers

    // Auto-format as user types
    if (inputValue.length >= 2) {
      inputValue = inputValue.slice(0, 2) + "/" + inputValue.slice(2);
    }
    if (inputValue.length >= 5) {
      inputValue = inputValue.slice(0, 5) + "/" + inputValue.slice(5, 9);
    }

    setDisplayValue(inputValue);

    // Only call onChange if we have a complete date
    if (inputValue.length === 10) {
      const formattedValue = formatDateForValue(inputValue);
      if (formattedValue) {
        onChange(formattedValue);
      }
    } else if (inputValue.length === 0) {
      onChange("");
    }
  };

  // Handle blur to validate and clean up
  const handleBlur = () => {
    if (displayValue.length === 10) {
      const formattedValue = formatDateForValue(displayValue);
      if (formattedValue) {
        onChange(formattedValue);
        setDisplayValue(formatDateForDisplay(formattedValue));
      } else {
        // Invalid date, clear it
        setDisplayValue("");
        onChange("");
      }
    } else if (displayValue.length > 0 && displayValue.length < 10) {
      // Incomplete date, clear it
      setDisplayValue("");
      onChange("");
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={10}
          className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg
            bg-white border border-gray-400
            text-gray-700 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
            transition ${className}`}
        />
      </div>
    </div>
  );
}
