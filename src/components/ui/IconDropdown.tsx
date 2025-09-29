import React, { useState } from 'react';
import { FaChevronDown, FaTicketAlt, FaFire, FaCalendarAlt } from 'react-icons/fa';

// Giả lập dữ liệu có thêm Icon
const iconOptions = [
  { label: 'Đặt vé', value: 'booking', icon: FaTicketAlt },
  { label: 'Phim Hot', value: 'hot_movies', icon: FaFire },
  { label: 'Lịch chiếu', value: 'showtimes', icon: FaCalendarAlt },
];

interface IconDropdownProps {
    label: string;
}

const IconDropdown: React.FC<IconDropdownProps> = ({ label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(iconOptions[0]);

  const handleSelect = (option: typeof iconOptions[0]) => {
    setSelected(option);
    setIsOpen(false);
  };

  const SelectedIcon = selected.icon; // Icon của lựa chọn hiện tại

  return (
    <div className="relative inline-block text-left z-20">
      {/* Nút chính */}
      <button
        type="button"
        className="inline-flex justify-between items-center w-full px-4 py-2 text-sm font-medium text-white bg-slate-800 border border-gray-700 rounded-md shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-yellow-400 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center">
            {/* Hiển thị Icon của mục đã chọn trên nút chính */}
            <SelectedIcon className="h-4 w-4 mr-2 text-yellow-400" /> 
            {selected.label}
        </div>
        <FaChevronDown className={`-mr-1 ml-2 h-4 w-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180 text-yellow-400' : ''}`} />
      </button>

      {/* Danh sách Dropdown */}
      {isOpen && (
        <div 
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-700 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {iconOptions.map((option) => {
              const OptionIcon = option.icon; // Icon của từng mục
              return (
                <a
                  key={option.value}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelect(option);
                  }}
                  className={`
                    ${selected.value === option.value ? 'bg-purple-700 text-white' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}
                    block px-4 py-2 text-sm transition-colors duration-150 flex items-center
                  `}
                  role="menuitem"
                >
                  <OptionIcon className="h-4 w-4 mr-3" /> {/* Hiển thị icon trước chữ */}
                  {option.label}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconDropdown;