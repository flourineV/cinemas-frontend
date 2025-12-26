import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { bookingService } from "@/services/booking/booking.service";
import type { CreateBookingRequest } from "@/types/booking/booking.type";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertTriangle } from "lucide-react";

interface Props {
  customer: { name: string; email: string; phone: string };
  setCustomer: (val: { name: string; email: string; phone: string }) => void;
  onNext: () => void;
  userLoggedIn: boolean;

  // New props for Guest flow
  pendingRequestData?: CreateBookingRequest;
  onBookingCreated?: (booking: any) => void;
}

const CustomerInfoStep: React.FC<Props> = ({
  customer,
  setCustomer,
  onNext,
  userLoggedIn,
  pendingRequestData,
  onBookingCreated,
}) => {
  const { t } = useLanguage();
  const [errors, setErrors] = useState<any>({});
  const [agreeAge, setAgreeAge] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Skip if logged in (Though CheckoutPage handles this, keep it safe)
  useEffect(() => {
    if (userLoggedIn) onNext();
  }, [userLoggedIn, onNext]);

  const validateAll = async () => {
    const newErrors: any = {};
    if (!customer.name?.trim()) newErrors.name = t("checkout.fullNameRequired");
    if (!customer.email?.trim()) newErrors.email = t("checkout.emailRequired");
    else if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(customer.email))
      newErrors.email = t("checkout.emailInvalid");
    if (!customer.phone?.trim()) newErrors.phone = t("checkout.phoneRequired");
    else if (!/^\d{9,11}$/.test(customer.phone))
      newErrors.phone = t("checkout.phoneInvalid");

    if (!agreeAge) newErrors.ageAgree = t("checkout.ageRequired");
    if (!agreeTerms) newErrors.terms = t("checkout.termsRequired");

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      await Swal.fire({
        icon: "warning",
        title: t("checkout.invalidInfo"),
        confirmButtonColor: "#eab308",
      });
      return false;
    }
    return true;
  };

  const handleProcess = async () => {
    const isValid = await validateAll();
    if (!isValid) return;

    // === LOGIC GỌI API CHO GUEST ===
    if (pendingRequestData && onBookingCreated) {
      try {
        Swal.fire({
          title: t("booking.creatingTicket"),
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const finalRequest: CreateBookingRequest = {
          ...pendingRequestData,
          guestName: customer.name,
          guestEmail: customer.email,
          // guestPhone: customer.phone, // Uncomment nếu API Backend có field phone
        };

        const bookingResponse =
          await bookingService.createBooking(finalRequest);

        Swal.close();

        // Notify Parent
        onBookingCreated(bookingResponse);
      } catch (error) {
        console.error(error);
        Swal.fire(t("booking.error"), t("booking.cannotCreateOrder"), "error");
      }
    } else {
      // Normal flow (shouldn't happen for Guest in this specific logic but good fallback)
      onNext();
    }
  };

  return (
    <motion.div
      key="customer-step"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-2xl p-8 border border-gray-400 space-y-6"
    >
      {/* Guest Warning Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-amber-800 mb-1">
            {t("checkout.guestWarningTitle")}
          </h4>
          <p className="text-sm text-amber-700">
            {t("checkout.guestWarningText")}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-md font-bold text-gray-800 block">
            {t("checkout.fullName")} <span className="text-red-500">*</span>
          </label>
          <input
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            className={`w-full bg-gray-50 text-gray-900 p-3 rounded-lg mt-2 border-2 focus:outline-none focus:border-yellow-500 transition-colors ${errors.name ? "border-red-500" : "border-gray-300"}`}
            placeholder="Nguyễn Văn A"
          />
        </div>
        <div>
          <label className="text-md font-bold text-gray-800 block">
            {t("checkout.email")} <span className="text-red-500">*</span>
          </label>
          <input
            value={customer.email}
            onChange={(e) =>
              setCustomer({ ...customer, email: e.target.value })
            }
            className={`w-full bg-gray-50 text-gray-900 p-3 rounded-lg mt-2 border-2 focus:outline-none focus:border-yellow-500 transition-colors ${errors.email ? "border-red-500" : "border-gray-300"}`}
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="text-md font-bold text-gray-800 block">
            {t("checkout.phone")} <span className="text-red-500">*</span>
          </label>
          <input
            value={customer.phone}
            onChange={(e) =>
              setCustomer({ ...customer, phone: e.target.value })
            }
            className={`w-full bg-gray-50 text-gray-900 p-3 rounded-lg mt-2 border-2 focus:outline-none focus:border-yellow-500 transition-colors ${errors.phone ? "border-red-500" : "border-gray-300"}`}
            placeholder="09xx xxx xxx"
          />
        </div>
      </div>

      <div className="space-y-3 mt-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={agreeAge}
            onChange={(e) => setAgreeAge(e.target.checked)}
          />
          <div
            className={`h-5 w-5 border rounded-sm flex items-center justify-center transition-all ${agreeAge ? "bg-yellow-500 border-yellow-500" : "bg-transparent border-gray-400"} ${errors.ageAgree && !agreeAge ? "border-red-500 animate-pulse" : ""}`}
          >
            {agreeAge && (
              <svg
                className="w-3.5 h-3.5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-700">
            {t("checkout.ageConfirm")}
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
          />
          <div
            className={`h-5 w-5 border rounded-sm flex items-center justify-center transition-all ${agreeTerms ? "bg-yellow-500 border-yellow-500" : "bg-transparent border-gray-400"} ${errors.terms && !agreeTerms ? "border-red-500 animate-pulse" : ""}`}
          >
            {agreeTerms && (
              <svg
                className="w-3.5 h-3.5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-700">
            {t("checkout.termsAgree")}
          </span>
        </label>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleProcess}
          className="bg-yellow-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-yellow-600 transition transform hover:scale-105 shadow-lg"
        >
          {t("checkout.continue")}
        </button>
      </div>
    </motion.div>
  );
};

export default CustomerInfoStep;
