import React from "react";
import { motion } from "framer-motion";
import SelectCombo from "@/components/booking/SelectCombo";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { seatLockService } from "@/services/showtime/seatLockService";
import { useLanguage } from "@/contexts/LanguageContext";

export interface SelectedComboItem {
  id: string;
  name: string;
  nameEn?: string;
  qty: number;
  price: number;
}

interface Props {
  selectedCombos?: Record<string, SelectedComboItem>;
  setSelectedCombos: (val: Record<string, SelectedComboItem>) => void;
  onNext: () => void;
  onPrev?: () => void;
  movieId: string;
  bookingId?: string;
  showtimeId?: string;
  seats?: Array<{ seatId: string }>;
}

const SelectComboStep: React.FC<Props> = ({
  selectedCombos = {},
  setSelectedCombos,
  onNext,
  movieId,
  showtimeId,
  seats,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Lấy identity từ auth-storage
  const getIdentity = () => {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const userId = parsed?.state?.user?.id;
        if (userId) {
          return { userId, guestSessionId: undefined };
        }
      } catch (e) {
        console.error("Error parsing auth-storage", e);
      }
    }
    return {
      userId: undefined,
      guestSessionId: localStorage.getItem("guestSessionId") ?? undefined,
    };
  };

  const handleBack = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: t("checkout.cancelBooking"),
      text: t("checkout.cancelBookingText"),
      showCancelButton: true,
      confirmButtonText: t("checkout.confirm"),
      cancelButtonText: t("checkout.stay"),
      confirmButtonColor: "#d97706",
      cancelButtonColor: "#374151",
    });

    if (result.isConfirmed) {
      // Unlock seats trước khi navigate
      if (showtimeId && seats && seats.length > 0) {
        const identity = getIdentity();
        console.log(
          "[SelectComboStep] Unlocking seats before going back:",
          seats.map((s) => s.seatId)
        );

        try {
          await Promise.all(
            seats.map((seat) =>
              seatLockService
                .unlockSingleSeat(
                  showtimeId,
                  seat.seatId,
                  identity.userId,
                  identity.guestSessionId
                )
                .catch((err) => {
                  console.error(`Failed to unlock seat ${seat.seatId}:`, err);
                })
            )
          );
          console.log("[SelectComboStep] Seats unlocked successfully");
        } catch (error) {
          console.error("[SelectComboStep] Error unlocking seats:", error);
        }
      }

      // Clear seat state từ localStorage
      const seatStateKey = `seat_state_${movieId}`;
      localStorage.removeItem(seatStateKey);

      navigate(`/movies/${movieId}`);
    }
  };

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <SelectCombo
          onComboSelect={setSelectedCombos}
          initialSelected={selectedCombos}
        />
      </div>
      <div className="flex justify-between mt-10">
        <button
          onClick={handleBack}
          className="bg-zinc-800 text-white py-3 px-6 rounded-lg shadow-md hover:bg-zinc-700 transition font-semibold border border-zinc-700"
        >
          {t("checkout.back")}
        </button>
        <button
          onClick={onNext}
          className="bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg shadow-md hover:bg-yellow-400 transition"
        >
          {t("checkout.next")}
        </button>
      </div>
    </motion.div>
  );
};

export default SelectComboStep;
