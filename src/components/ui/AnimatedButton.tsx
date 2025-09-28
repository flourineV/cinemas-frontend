import React, { type ButtonHTMLAttributes } from 'react';

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'yellow-to-orange' | 'secondary' | 'orange' | 'primary'; 
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  children, 
  variant = 'yellow-to-orange', 
  className = '', 
  ...props 
}) => {
  let baseBgClasses = '';
  let baseTextClasses = '';
  let hoverFillColor = '';
  let contentTextClasses = ''; // Dùng biến này cho lớp nội dung
  let disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed';

  switch (variant) {
    case 'yellow-to-orange':
    default:
      // Màu nền MẶC ĐỊNH: Vàng
      baseBgClasses = 'bg-yellow-400'; 
      // Màu chữ mặc định TRÊN NÚT: KHÔNG CẦN, chỉ cần set màu chữ cho SPAN
      baseTextClasses = ''; 
      // Lớp màu trượt: CAM
      hoverFillColor = 'bg-orange-500'; 
      // Lớp chữ nội dung: Đen (mặc định) -> Trắng (hover)
      contentTextClasses = 'text-gray-900 group-hover:text-white'; 
      break;

    case 'orange':
      // Chuyển từ viền cam sang Cam đặc
      baseBgClasses = 'bg-transparent border-2 border-orange-500';
      hoverFillColor = 'bg-orange-500'; 
      contentTextClasses = 'text-orange-400 group-hover:text-white';
      break;

    case 'secondary':
      // Chuyển từ viền tím sang Tím đặc
      baseBgClasses = 'bg-transparent border-2 border-purple-700';
      hoverFillColor = 'bg-purple-700';
      contentTextClasses = 'text-purple-700 group-hover:text-white';
      break;
      
    case 'primary':
      // Tím -> Tím đậm hơn
      baseBgClasses = 'bg-purple-700'; 
      hoverFillColor = 'bg-purple-800'; 
      contentTextClasses = 'text-white group-hover:text-white'; // Luôn trắng
      break;
  }

  return (
    <button
      className={`
        relative overflow-hidden 
        px-6 py-2 rounded-sm font-bold transition-all duration-500 ease-out 
        ${baseBgClasses} 
        ${baseTextClasses} 
        ${disabledClasses}
        ${className} 
        group
        focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-black/40
      `}
      {...props}
    >
      {/* Lớp màu sẽ trượt vào */}
      <span
        className={`
          absolute inset-0 block 
          w-full h-full 
          transform -translate-x-full 
          transition-transform duration-500 ease-out 
          group-hover:translate-x-0 
          ${hoverFillColor}
        `}
        aria-hidden="true" 
      />
      
      {/* Nội dung nút: Luôn nằm trên lớp màu trượt và thay đổi màu chữ */}
      <span className={`relative z-10 transition-colors duration-500 ease-out ${contentTextClasses}`}>
        {children}
      </span>
    </button>
  );
};

export default AnimatedButton;