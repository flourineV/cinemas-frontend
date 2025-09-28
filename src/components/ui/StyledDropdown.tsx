import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa'; // Icon mũi tên

// Giả lập dữ liệu cho dropdown
const options = [
  { label: 'Phim đang chiếu', value: 'now_showing' },
  { label: 'Phim sắp chiếu', value: 'upcoming' },
  { label: 'Khuyến mãi', value: 'promotions' },
];

interface StyledDropdownProps {
  label: string;
}

const StyledDropdown: React.FC<StyledDropdownProps> = ({ label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(options[0]); // Mặc định chọn mục đầu tiên

  const handleSelect = (option: typeof options[0]) => {
    setSelected(option);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left z-20">
      {/* Nút chính hiển thị giá trị đã chọn */}
      <button
        type="button"
        className="inline-flex justify-between items-center w-full px-4 py-2 text-sm font-medium text-white bg-slate-800 border border-gray-700 rounded-md shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-yellow-400 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {selected.label}
        <FaChevronDown className={`-mr-1 ml-2 h-4 w-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180 text-yellow-400' : ''}`} />
      </button>

      {/* Danh sách Dropdown (Điều kiện hiển thị) */}
      {isOpen && (
        <div 
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-700 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {options.map((option) => (
              <a
                key={option.value}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect(option);
                }}
                className={`
                  ${selected.value === option.value ? 'bg-purple-700 text-white' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}
                  block px-4 py-2 text-sm transition-colors duration-150
                `}
                role="menuitem"
              >
                {option.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StyledDropdown;