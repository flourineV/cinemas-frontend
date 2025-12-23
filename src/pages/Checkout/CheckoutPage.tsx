import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Swal from "sweetalert2";
import Layout from "@/components/layout/Layout";
import { useAccurateTimer } from "@/hooks/useAccurateTimer";
import { useLanguage } from "@/contexts/LanguageContext";

import SelectComboStep from "@/components/checkout/SelectComboStep";
import CustomerInfoStep from "@/components/checkout/CustomerInfoStep";
import PaymentStep from "@/components/checkout/PaymentStep";
import ConfirmStep from "@/components/checkout/ConfirmStep";
import BookingSummary from "@/components/checkout/BookingSummary";

import type { SelectedComboItem } from "@/components/checkout/SelectComboStep";
import type { PromotionResponse } from "@/types/promotion/promotion.type";

const STEPS = [
  { id: 1, labelKey: "checkout.step1" },
  { id: 2, labelKey: "checkout.step2" },
  { id: 3, labelKey: "checkout.step3" },
  { id: 4, labelKey: "checkout.step4" },
];

const CHECKOUT_STORAGE_KEY = "cinehub-checkout-state";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const [booking, setBooking] = useState<any>(null); // Booking chính thức
  const [pendingData, setPendingData] = useState<any>(null); // Draft cho Guest

  const [activeStep, setActiveStep] = useState(1);
  const [selectedCombos, setSelectedCombos] = useState<
    Record<string, SelectedComboItem>
  >({});
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromotionResponse | null>(
    null
  );
  const [initialTTL, setInitialTTL] = useState<number | null>(null);
  const [useRankDiscount, setUseRankDiscount] = useState(false);
  const [rankDiscountValue, setRankDiscountValue] = useState(0);

  // Save checkout state to sessionStorage when it changes
  useEffect(() => {
    if (booking) {
      const stateToSave = {
        activeStep,
        selectedCombos,
        customer,
        paymentMethod,
        appliedPromo,
        useRankDiscount,
        rankDiscountValue,
        bookingId: booking?.id || booking?.bookingId,
      };
      sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [
    activeStep,
    selectedCombos,
    customer,
    paymentMethod,
    appliedPromo,
    useRankDiscount,
    rankDiscountValue,
    booking,
  ]);

  // --- 1. NHẬN DỮ LIỆU ---
  useEffect(() => {
    const stateData = location.state;
    if (!stateData) {
      navigate("/");
      return;
    }

    // Try to restore saved state from sessionStorage
    const savedState = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    let restoredState: any = null;
    if (savedState) {
      try {
        restoredState = JSON.parse(savedState);
      } catch (e) {
        console.error("Failed to parse saved checkout state:", e);
      }
    }

    if (stateData.booking) {
      // === CASE A: User (Đã có booking) ===
      console.log("📦 Booking data from API:", stateData.booking);
      setBooking(stateData.booking);
      setUserLoggedIn(true);

      // Restore state if same booking
      const currentBookingId =
        stateData.booking.id || stateData.booking.bookingId;
      if (restoredState && restoredState.bookingId === currentBookingId) {
        console.log("📦 Restoring checkout state from sessionStorage");
        setActiveStep(restoredState.activeStep || 2);
        setSelectedCombos(restoredState.selectedCombos || {});
        setCustomer(
          restoredState.customer || { name: "", email: "", phone: "" }
        );
        setPaymentMethod(restoredState.paymentMethod || "momo");
        setAppliedPromo(restoredState.appliedPromo || null);
        setUseRankDiscount(restoredState.useRankDiscount || false);
        setRankDiscountValue(restoredState.rankDiscountValue || 0);
      } else {
        setActiveStep(2); // Nhảy Step 2
      }

      setupTTL(stateData.ttl, stateData.ttlTimestamp);

      // Auto-fill customer info từ booking response
      if (stateData.booking.guestName) {
        setCustomer((prev) => ({
          ...prev,
          name: stateData.booking.guestName,
          email: stateData.booking.guestEmail || "",
        }));
      }
    } else if (stateData.selectedSeats) {
      // === CASE B: Guest (Chưa có booking) - Data from SeatSelectionPage ===
      const pendingData = {
        selectedSeats: stateData.selectedSeats,
        selectedTickets: stateData.selectedTickets,
        showtimeDetail: stateData.showtimeDetail,
        showtimeId: stateData.showtimeId,
      };

      setPendingData(pendingData);
      setActiveStep(1); // Ở lại Step 1

      // Mock booking cho Summary hiển thị
      console.log("📦 Guest data from SeatSelection:", stateData);
      setBooking({
        totalPrice: 0, // Will be calculated
        movieTitle: t("checkout.movie"), // Placeholder
        showtime: stateData.showtimeDetail,
        seats: stateData.selectedSeats || [],
      });
    } else if (stateData.pendingData) {
      // === CASE B: Guest (Chưa có booking) ===
      setPendingData(stateData.pendingData);
      setActiveStep(1); // Ở lại Step 1

      setupTTL(stateData.pendingData.ttl, stateData.pendingData.ttlTimestamp);

      // Mock booking cho Summary hiển thị - map đầy đủ thông tin từ pendingData
      console.log("📦 Guest pending data:", stateData.pendingData);
      const pd = stateData.pendingData;
      setBooking({
        totalPrice: pd.totalPrice || 0,
        movieId: pd.movieId,
        movieTitle: pd.movieTitle,
        showtime: pd.showtime,
        // Map seats với seatNumber để hiển thị đúng
        seats: (pd.seats || pd.selectedSeats || []).map((s: any) => ({
          ...s,
          seatNumber: s.seatNumber || s.seatId || s.name,
        })),
        // Thêm các field khác từ showtime để BookingSummary có thể hiển thị
        theaterName: pd.showtime?.theaterName,
        theaterNameEn: pd.showtime?.theaterNameEn,
        roomName: pd.showtime?.roomName,
        roomNameEn: pd.showtime?.roomNameEn,
        startTime: pd.showtime?.startTime,
      });
    }
  }, []);

  const setupTTL = (ttl: number, timestamp: number) => {
    if (ttl && timestamp) {
      const now = Date.now();
      const passed = Math.floor((now - timestamp) / 1000);
      const remaining = ttl - passed;
      if (remaining <= 0) {
        // Không auto redirect, chỉ set initialTTL = 0 để trigger SweetAlert
        setInitialTTL(0);
      } else {
        setInitialTTL(remaining);
      }
    }
  };

  // --- 2. XỬ LÝ KHI GUEST TẠO VÉ THÀNH CÔNG ---
  const handleGuestBookingCreated = (createdBooking: any) => {
    setBooking(createdBooking);
    setPendingData(null);
    setActiveStep(2);
  };

  const handleExpired = () => {
    // Lấy movieId từ nhiều nguồn khác nhau
    const movieId =
      booking?.movieId ||
      booking?.movie?.id ||
      pendingData?.movieId ||
      pendingData?.requestData?.movieId;

    const redirectPath = movieId ? `/movies/${movieId}` : "/";

    Swal.fire({
      icon: "error",
      title: t("checkout.seatExpired"),
      text: t("checkout.seatExpiredText"),
      confirmButtonText: t("checkout.rebookTicket"),
      confirmButtonColor: "#d97706",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Redirecting to:", redirectPath);
        navigate(redirectPath);
      }
    });
  };

  // Use accurate timer that handles tab switching
  const timeLeft = useAccurateTimer({
    initialTime: initialTTL,
    onExpired: handleExpired,
    enabled: true,
  });

  // --- Scroll ---
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeStep]);

  // --- Calculations ---
  const comboTotal = useMemo(
    () =>
      Object.values(selectedCombos).reduce(
        (sum, c) => sum + c.qty * c.price,
        0
      ),
    [selectedCombos]
  );

  const discountValue = useMemo(() => {
    if (!appliedPromo) return 0;
    const total = (booking?.totalPrice ?? 0) + comboTotal;
    return appliedPromo.discountType === "PERCENTAGE"
      ? Math.round(total * (Number(appliedPromo.discountValue) / 100))
      : Number(appliedPromo.discountValue);
  }, [appliedPromo, booking, comboTotal]);

  const finalTotal = useMemo(() => {
    const total = (booking?.totalPrice ?? 0) + comboTotal;
    let totalDiscount = discountValue;

    // Add rank discount if enabled
    if (useRankDiscount && rankDiscountValue > 0) {
      totalDiscount += Math.round(total * (rankDiscountValue / 100));
    }

    return Math.max(total - totalDiscount, 0);
  }, [booking, comboTotal, discountValue, useRankDiscount, rankDiscountValue]);

  // --- Navigation Handlers ---
  const handleNextStep = () => setActiveStep((prev) => prev + 1);
  const handlePrevStep = () => setActiveStep((prev) => Math.max(1, prev - 1));
  const handleConfirmPayment = () => navigate("/payment-success");

  if (!booking) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 flex flex-col pb-10">
        <main className="container mx-auto px-4 md:px-6 mt-14 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
            {/* LEFT COLUMN */}
            <div className="flex flex-col space-y-8 lg:col-span-2">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl md:text-4xl font-extrabold text-yellow-500 mb-6 uppercase tracking-tighter">
                  {t("checkout.title")}{" "}
                  <span className="text-black">
                    {t("checkout.titleHighlight")}
                  </span>
                </h1>
                {/* Steps Bar */}
                <div className="flex justify-between items-start w-full mt-16">
                  {STEPS.map((step, index) => {
                    const isActive = activeStep === step.id;
                    const isCompleted = activeStep > step.id;
                    return (
                      <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center z-10 relative flex-1">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                              isActive || isCompleted
                                ? "bg-yellow-500 text-black"
                                : "bg-gray-700 text-gray-400"
                            }`}
                          >
                            <span className="text-xl font-bold">{step.id}</span>
                          </div>
                          <span
                            className={`text-[10px] md:text-xs font-bold uppercase text-center transition-colors ${isActive || isCompleted ? "text-yellow-500" : "text-gray-500"}`}
                          >
                            {t(step.labelKey)}
                          </span>
                        </div>
                        {index < STEPS.length - 1 && (
                          <div className="flex-1 h-[2px] mt-6 relative">
                            <div className="absolute top-0 left-0 w-full h-full bg-gray-700"></div>
                            <motion.div
                              initial={{ width: "0%" }}
                              animate={{ width: isCompleted ? "100%" : "0%" }}
                              transition={{ duration: 0.5 }}
                              className="absolute top-0 left-0 h-full bg-yellow-500"
                            />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Content */}
              <div className="rounded-xl min-h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activeStep === 1 && (
                      <CustomerInfoStep
                        customer={customer}
                        setCustomer={setCustomer}
                        onNext={handleNextStep}
                        userLoggedIn={userLoggedIn}
                        // Props for Guest
                        pendingRequestData={pendingData?.requestData}
                        onBookingCreated={handleGuestBookingCreated}
                      />
                    )}
                    {activeStep === 2 && (
                      <SelectComboStep
                        selectedCombos={selectedCombos}
                        setSelectedCombos={setSelectedCombos}
                        onNext={handleNextStep}
                        onPrev={handlePrevStep}
                        movieId={booking.movieId || pendingData?.movieId || ""}
                        bookingId={booking?.id || booking?.bookingId}
                      />
                    )}
                    {activeStep === 3 && (
                      <PaymentStep
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        appliedPromo={appliedPromo}
                        onApplyPromo={setAppliedPromo}
                        bookingId={booking?.id || booking?.bookingId || ""}
                        selectedCombos={selectedCombos}
                        userId={booking?.userId}
                        useRankDiscount={useRankDiscount}
                        onToggleRankDiscount={setUseRankDiscount}
                        onRankDiscountValueChange={setRankDiscountValue}
                        onNext={handleNextStep}
                        onPrev={handlePrevStep}
                      />
                    )}
                    {activeStep === 4 && (
                      <ConfirmStep
                        booking={booking}
                        comboTotal={comboTotal}
                        finalTotal={finalTotal}
                        appliedPromo={appliedPromo}
                        discountValue={discountValue}
                        onPrev={handlePrevStep}
                        onConfirm={handleConfirmPayment}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-1">
              <BookingSummary
                booking={booking}
                selectedCombos={selectedCombos}
                comboTotal={comboTotal}
                appliedPromo={appliedPromo}
                discountValue={discountValue}
                finalTotal={finalTotal}
                useRankDiscount={useRankDiscount}
                rankDiscountValue={rankDiscountValue}
                ttl={timeLeft}
              />
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
