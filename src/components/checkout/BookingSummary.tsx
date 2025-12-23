import React, { useEffect, useState } from "react";
import type { SelectedComboItem } from "./SelectComboStep";
import type { PromotionResponse } from "@/types/promotion/promotion.type";
import { userProfileService } from "@/services/userprofile/userProfileService";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  booking: any;
  selectedCombos: Record<string, SelectedComboItem>;
  comboTotal: number;
  appliedPromo: PromotionResponse | null;
  discountValue: number;
  finalTotal: number;
  useRankDiscount: boolean;
  rankDiscountValue: number;
  ttl?: number | null; // <-- new prop: ttl in seconds, null = chưa lock ghế
}

const DEFAULT_TTL_DISPLAY = 300; // 5 phút

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const BookingSummary: React.FC<Props> = ({
  booking,
  selectedCombos,
  comboTotal,
  appliedPromo,
  discountValue,
  finalTotal,
  useRankDiscount,
  rankDiscountValue,
  ttl = null,
}) => {
  const { t, language } = useLanguage();
  const [userRank, setUserRank] = useState<string | null>(null);

  const combosArray = Object.values(selectedCombos).filter((c) => c.qty > 0);

  // Fetch user rank
  useEffect(() => {
    const fetchRank = async () => {
      try {
        const userId = booking?.userId;
        if (userId) {
          const data = await userProfileService.getRankAndDiscount(userId);
          setUserRank(data.rankName);
        }
      } catch (error) {
        console.error("Failed to fetch rank:", error);
      }
    };

    fetchRank();
  }, [booking?.userId]);

  // timeToShow: nếu ttl === null => show default 5:00
  const timeToShow = ttl === null ? DEFAULT_TTL_DISPLAY : ttl;

  // bg class logic (match BookingSummaryBar)
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
            {t("checkout.orderSummary")}
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
          <div className="flex justify-between">
            <span>{t("checkout.movie")}</span>
            <span className="font-semibold">
              {booking.movieTitle || booking.movie?.title || "N/A"}
            </span>
          </div>
          <div className="flex justify-between mt-2">
            <span>{t("checkout.theater")}</span>
            <span className="font-semibold">
              {language === "en"
                ? (booking.showtime?.theaterNameEn ??
                  booking.showtime?.theaterName ??
                  booking.theater?.nameEn ??
                  booking.theater?.name ??
                  booking.cinemaName ??
                  "N/A")
                : (booking.showtime?.theaterName ??
                  booking.showtime?.cinemaName ??
                  booking.theater?.name ??
                  booking.cinemaName ??
                  "N/A")}
            </span>
          </div>
          <div className="flex justify-between mt-2">
            <span>{t("checkout.room")}</span>
            <span className="font-semibold">
              {language === "en"
                ? (booking.showtime?.roomNameEn ??
                  booking.showtime?.roomName ??
                  booking.roomNameEn ??
                  booking.roomName ??
                  "N/A")
                : (booking.showtime?.roomName ?? booking.roomName ?? "N/A")}
            </span>
          </div>
          <div className="flex justify-between mt-2">
            <span>{t("checkout.time")}</span>
            <span className="font-semibold">
              {booking.showtime?.startTime
                ? new Date(booking.showtime.startTime).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : (booking.showtime?.time ?? booking.startTime ?? "N/A")}
            </span>
          </div>
          <div className="flex justify-between mt-2">
            <span>{t("checkout.seats")}</span>
            <span className="font-semibold">
              {(() => {
                console.log(
                  "🪑 [BookingSummary] booking.seats:",
                  booking.seats
                );
                console.log("🪑 [BookingSummary] booking object:", booking);

                const seats = booking.seats || booking.selectedSeats || [];
                console.log("🪑 [BookingSummary] processed seats:", seats);

                return (
                  seats
                    .map((s: any) => {
                      console.log(
                        "🪑 [BookingSummary] processing seat:",
                        s,
                        "type:",
                        typeof s
                      );

                      if (typeof s === "string") return s;
                      if (typeof s === "object" && s !== null) {
                        // Try multiple possible properties
                        const seatName =
                          s.seatNumber || s.seatId || s.name || s.id;
                        console.log(
                          "🪑 [BookingSummary] extracted seatName:",
                          seatName
                        );
                        return seatName || "N/A";
                      }
                      return "N/A";
                    })
                    .join(", ") || "N/A"
                );
              })()}
            </span>
          </div>

          {/* User Rank */}
          {userRank && (
            <div className="mt-3 pt-3 border-t border-gray-300">
              <div className="flex justify-between items-center">
                <span className="text-sm">{t("checkout.memberRank")}</span>
                <span className="font-bold text-yellow-600 text-lg">
                  {userRank}
                </span>
              </div>
            </div>
          )}

          <div className="mt-3">
            <div className="font-semibold text-gray-800">
              {t("checkout.combo")}
            </div>
            {combosArray.length === 0 ? (
              <div className="text-gray-500 text-sm">
                {t("checkout.noCombo")}
              </div>
            ) : (
              <ul className="text-sm list-disc ml-4 mt-2">
                {combosArray.map((c, idx) => (
                  <li key={idx}>
                    {language === "en" && c.nameEn ? c.nameEn : c.name} x{" "}
                    {c.qty} — {(c.qty * c.price).toLocaleString()} VND
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-4 border-t border-gray-300 mt-4">
            <div className="flex justify-between text-gray-700">
              <span>{t("checkout.subtotal")}</span>
              <span>{booking.totalPrice.toLocaleString()} VND</span>
            </div>
            <div className="flex justify-between text-gray-700 mt-2">
              <span>{t("checkout.combo")}</span>
              <span>{comboTotal.toLocaleString()} VND</span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between text-red-600 mt-2">
                <span>
                  {t("checkout.promoDiscount")} ({appliedPromo.code})
                </span>
                <span>
                  -
                  {appliedPromo.discountType === "PERCENTAGE"
                    ? `${appliedPromo.discountValue}%`
                    : discountValue.toLocaleString() + " VND"}
                </span>
              </div>
            )}
            {useRankDiscount && rankDiscountValue > 0 && userRank && (
              <div className="flex justify-between text-green-600 mt-2">
                <span>
                  {t("checkout.rankDiscountLabel")} {userRank}
                </span>
                <span>-{rankDiscountValue}%</span>
              </div>
            )}
            <div className="flex justify-between text-yellow-600 font-bold mt-3 text-lg">
              <span>{t("checkout.total")}</span>
              <span>{finalTotal.toLocaleString()} VND</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default BookingSummary;
