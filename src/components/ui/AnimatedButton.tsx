import React, { type ButtonHTMLAttributes } from "react";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  // Đã thêm 'orange-to-f3ea28' vào union
  variant?:
    | "yellow-to-orange"
    | "orange-to-f3ea28"
    | "secondary"
    | "orange"
    | "primary";
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = "yellow-to-orange",
  className = "",
  ...props
}) => {
  let baseBgClasses = "";
  let baseTextClasses = "";
  let hoverFillColor = "";
  let contentTextClasses = "";
  let disabledClasses = "disabled:opacity-50 disabled:cursor-not-allowed";

  switch (variant) {
    case "yellow-to-orange":
    default:
      baseBgClasses = "bg-[#F3EA28]";
      baseTextClasses = "";
      hoverFillColor = "bg-orange-500";
      contentTextClasses = "text-black group-hover:text-white";
      break;

    case "orange-to-f3ea28":
      baseBgClasses = "bg-[#FF8D00]";
      hoverFillColor = "bg-[#D1EB23]";
      contentTextClasses = "text-gray-700 group-hover:text-black";
      break;

    case "orange":
      baseBgClasses = "bg-transparent border-2 border-orange-500";
      hoverFillColor = "bg-orange-500";
      contentTextClasses = "text-orange-400 group-hover:text-white";
      break;

    case "secondary":
      baseBgClasses = "bg-transparent border-2 border-purple-700";
      hoverFillColor = "bg-purple-700";
      contentTextClasses = "text-purple-700 group-hover:text-white";
      break;

    case "primary":
      baseBgClasses = "bg-purple-700";
      hoverFillColor = "bg-purple-800";
      contentTextClasses = "text-white group-hover:text-white";
      break;
  }

  return (
    <button
      className={`
        relative overflow-hidden 
        px-6 py-2 rounded-lg font-bold transition-all duration-500 ease-out 
        ${baseBgClasses} 
        ${baseTextClasses} 
        ${disabledClasses}
        ${className} 
        group
        focus:outline-none
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
      <span
        className={`relative z-10 transition-colors duration-500 ease-out ${contentTextClasses}`}
      >
        {children}
      </span>
    </button>
  );
};

export default AnimatedButton;
