import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface FnbSummaryBarProps {
  theaterName: string;
  totalPrice: number;
  itemCount: number;
  isVisible: boolean;
  onSubmit: () => void;
  loading?: boolean;
}

const FnbSummaryBar: React.FC<FnbSummaryBarProps> = ({
  theaterName,
  totalPrice,
  itemCount,
  isVisible,
  onSubmit,
  loading = false,
}) => {
  const { t } = useLanguage();
  const [isSticky, setIsSticky] = useState(true);
  const [topPosition, setTopPosition] = useState(0);
  const barRef = React.useRef<HTMLDivElement>(null);

  // Handle Scroll logic (Sticky/Absolute)
  useEffect(() => {
    const handleScroll = () => {
      const footer = document.getElementById("footer");
      if (!footer || !barRef.current) return;

      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const barHeight = barRef.current.offsetHeight;

      if (footerRect.top <= windowHeight) {
        setIsSticky(false);
        const footerTop = footer.offsetTop;
        setTopPosition(footerTop - barHeight);
      } else {
        setIsSticky(true);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const barContent = (
    <div
      ref={barRef}
      className={`w-full left-0 right-0 z-50 ${isSticky ? "fixed bottom-0" : "absolute"}`}
      style={
        !isSticky ? { top: `${topPosition}px`, left: 0, right: 0 } : undefined
      }
    >
      <div className="bg-yellow-600 h-28 text-white flex justify-between items-center px-8 md:px-16 lg:px-32 xl:px-56 shadow-lg border-t border-yellow-600/30">
        <div>
          <h2 className="text-2xl font-extrabold text-black">
            {t("fnb.snacks")}
          </h2>
          <p className="text-md text-gray-800 mt-2">{theaterName}</p>
        </div>

        <div className="flex items-center gap-6">
          {/* Số lượng món */}
          <div className="h-20 px-4 py-1 rounded-md bg-yellow-200 text-black flex flex-col items-center justify-center min-w-[140px]">
            <span className="text-[11px] font-semibold uppercase opacity-90">
              {t("fnb.itemCount")}
            </span>
            <span className="text-xl font-extrabold leading-none mt-2">
              {itemCount} {t("fnb.items")}
            </span>
          </div>

          {/* Container gom nhóm Tiền và Nút */}
          <div className="flex flex-col gap-2 min-w-[240px]">
            {/* Hàng 1: Tạm tính */}
            <div className="flex justify-between items-baseline pt-3">
              <span className="text-black text-md font-medium">
                {t("fnb.subtotal")}
              </span>
              <span className="text-xl font-bold text-black">
                {totalPrice.toLocaleString()} VNĐ
              </span>
            </div>

            {/* Hàng 2: Nút Tiếp tục */}
            <button
              onClick={onSubmit}
              disabled={loading}
              className="w-full h-11 mb-3 bg-yellow-200 hover:bg-yellow-400 text-black font-bold py-3 rounded-md uppercase tracking-wide transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
                  {t("fnb.processing")}
                </>
              ) : (
                t("fnb.continue")
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render at document body level for true full width
  return createPortal(barContent, document.body);
};

export default FnbSummaryBar;
