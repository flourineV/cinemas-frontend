// StyledSelect.tsx
import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface StyledSelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  stepNumber: number;
}

const StyledSelect: React.FC<StyledSelectProps> = ({ 
  label, 
  options, 
  value, 
  onChange, 
  disabled, 
  stepNumber 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Tìm option đang được chọn để hiển thị label
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  const currentLabel = selectedOption.value ? selectedOption.label : `${stepNumber}. ${label}`;
  
  // Class cho trạng thái disabled
  const disabledClasses = disabled 
    ? "opacity-50 cursor-not-allowed bg-slate-800"
    : "hover:bg-slate-700 bg-slate-800 focus:ring-yellow-400";

  return (
    <div className="relative w-full text-left" onBlur={() => setIsOpen(false)} tabIndex={0}>
      <button
        type="button"
        className={`inline-flex justify-between items-center w-full px-4 py-2 text-sm font-semibold text-white border border-gray-700 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 ${disabledClasses}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={`${selectedOption.value ? 'text-white' : 'text-gray-400'}`}>
            {currentLabel}
        </span>
        <FaChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180 text-yellow-400' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute left-0 mt-2 w-full rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-700 max-h-60 overflow-y-auto z-50"
        >
          <div className="py-1">
            {options.slice(1).map((option) => ( // Bỏ option đầu tiên (placeholder)
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`
                  ${selectedOption.value === option.value ? 'bg-purple-700 text-white' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}
                  ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  block px-4 py-2 text-sm transition-colors duration-150
                `}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StyledSelect;