import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CartItem {
  id: string;
  name: string;
  nameEn?: string;
  unitPrice: number;
  quantity: number;
}

interface Props {
  theater: {
    name: string;
    nameEn?: string;
    address: string;
    addressEn?: string;
  };
  cart: CartItem[];
  totalAmount: number;
  ttl?: number | null;
  orderCode?: string;
}

const DEFAULT_TTL_DISPLAY = 300; // 5 phút

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const FnbOrderSummary: React.FC<Props> = ({
  theater,
  cart,
  totalAmount,
  ttl = null,
  orderCode,
}) => {
  const { t, language } = useLanguage();

  // timeToShow: nếu ttl === null => show default 5:00
  const timeToShow = ttl === null ? DEFAULT_TTL_DISPLAY : ttl;

  // bg class logic (match BookingSummary)
  const ttlBgClass =
    ttl === null
      ? "bg-gray-300 text-gray-600"
      : timeToShow <= 60
        ? "bg-red-400 text-black animate-pulse"
        : timeToShow <= 120
          ? "bg-orange-300 text-black"
          : "bg-yellow-200 text-black";

  return (
    <aside className="space-y-4 lg:sticky lg:top-20 self-start">
      <div className="bg-white border-2 border-gray-400 rounded-2xl p-6 shadow-lg">
        {/* Header row with title + TTL on the right */}
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-extrabold text-gray-800">
            {t("fnb.yourOrder")}
          </h3>

          <div
            className={`h-9 px-3 py-1 rounded-md flex items-center justify-center min-w-[96px] ${ttlBgClass}`}
          >
            <div className="text-xs font-semibold uppercase opacity-90 mr-2">
              {t("checkout.holdTime")}
            </div>
            <div className="text-sm font-extrabold leading-none">
              {formatTime(timeToShow)}
            </div>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-700">
          {/* Order Code */}
          {orderCode && (
            <div className="flex justify-between">
              <span>{t("fnb.orderCode")}</span>
              <span className="font-semibold">{orderCode}</span>
            </div>
          )}

          {/* Theater Info */}
          <div className="flex justify-between mt-2">
            <span>{t("fnb.theater")}</span>
            <span className="font-semibold">
              {language === "en" && theater.nameEn
                ? theater.nameEn
                : theater.name}
            </span>
          </div>

          <div className="flex justify-between mt-2">
            <span>{t("fnb.address")}</span>
            <span className="font-semibold text-right max-w-[200px]">
              {language === "en" && theater.addressEn
                ? theater.addressEn
                : theater.address}
            </span>
          </div>

          {/* Cart Items */}
          <div className="mt-4 pt-4 border-t border-gray-300">
            <div className="font-semibold text-gray-800 mb-2">
              {t("fnb.items")}
            </div>
            {cart.length === 0 ? (
              <div className="text-gray-500 text-sm">{t("fnb.noItems")}</div>
            ) : (
              <ul className="text-sm list-disc ml-4 space-y-1">
                {cart.map((item) => (
                  <li key={item.id}>
                    {language === "en" && item.nameEn ? item.nameEn : item.name}{" "}
                    x {item.quantity} —{" "}
                    {(item.unitPrice * item.quantity).toLocaleString()} VND
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-gray-300 mt-4">
            <div className="flex justify-between text-yellow-600 font-bold text-lg">
              <span>{t("fnb.total")}</span>
              <span>{totalAmount.toLocaleString()} VND</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FnbOrderSummary;
