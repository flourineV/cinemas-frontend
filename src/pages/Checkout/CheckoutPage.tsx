import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import SelectComboStep from "@/components/checkout/SelectComboStep";
import CustomerInfoStep from "@/components/checkout/CustomerInfoStep";
import PaymentStep from "@/components/checkout/PaymentStep";
import ConfirmStep from "@/components/checkout/ConfirmStep";
import BookingSummary from "@/components/checkout/BookingSummary";
import type { SelectedComboItem } from "@/components/checkout/SelectComboStep";
import type { PromotionResponse } from "@/types/promotion/promotion.type";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [selectedCombos, setSelectedCombos] = useState<Record<string, SelectedComboItem>>({});
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  // Promo
  const [appliedPromo, setAppliedPromo] = useState<PromotionResponse | null>(null);

  // Lấy booking và user
  useEffect(() => {
    const saved = localStorage.getItem("PENDING_BOOKING");
    if (!saved) {
      navigate("/");
      return;
    }
    setBooking(JSON.parse(saved));

    const user = localStorage.getItem("USER_INFO");
    if (user) {
      setUserLoggedIn(true);
      setCustomer(JSON.parse(user));
    }
  }, []);

  // Scroll lên đầu khi step thay đổi
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeStep]);

  // Tính tổng combo
  const comboTotal = useMemo(() => {
    return Object.values(selectedCombos).reduce((sum, c) => sum + c.qty * c.price, 0);
  }, [selectedCombos]);

  // Tính giá trị giảm
  const discountValue = useMemo(() => {
    if (!appliedPromo) return 0;
    const total = (booking?.totalPrice ?? 0) + comboTotal;
    return appliedPromo.discountType === "PERCENTAGE"
      ? Math.round(total * (Number(appliedPromo.discountValue) / 100))
      : Number(appliedPromo.discountValue);
  }, [appliedPromo, booking, comboTotal]);

  // Tổng cuối cùng
  const finalTotal = useMemo(() => {
    const total = (booking?.totalPrice ?? 0) + comboTotal;
    return Math.max(total - discountValue, 0);
  }, [booking, comboTotal, discountValue]);

  const [maxStepReached, setMaxStepReached] = useState(1);
  useEffect(() => {
    if (activeStep > maxStepReached) setMaxStepReached(activeStep);
  }, [activeStep]);

  const handleNextStep = (nextStep: number) => {
    if (nextStep === 2 && activeStep === 1) setActiveStep(2);
    else if (nextStep === 3 && activeStep === 2) {
      if (!userLoggedIn && (!customer.name || !customer.email || !customer.phone)) {
        alert("Vui lòng điền thông tin khách hàng!");
        return;
      }
      setActiveStep(3);
    } else if (nextStep === 4 && activeStep === 3) setActiveStep(4);
  };

  const handleConfirmPayment = () => {
    const payload = {
      ...booking,
      combos: selectedCombos,
      customer,
      paymentMethod,
      finalTotal,
      appliedPromo,
    };
    localStorage.removeItem("PENDING_BOOKING");
    localStorage.setItem("LAST_BOOKING", JSON.stringify(payload));
    navigate("/payment-success");
  };

  const handleApplyPromo = (promo: PromotionResponse | null) => {
    setAppliedPromo(promo);
  };

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-[#0A0F24] text-white flex flex-col">
      <Header />
      <main className="container mx-auto px-6 py-20 flex-1">
        <h1 className="text-4xl font-extrabold text-center text-yellow-300 mb-8">Trang Thanh toán</h1>

        {/* Step Buttons */}
        <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between gap-4">
          {[1,2,3,4].map(step => {
            const disabled = step > maxStepReached;
            return (
              <button key={step} 
                onClick={() => !disabled && setActiveStep(step)}
                className={`w-full text-sm py-3 rounded-2xl font-semibold transition-all
                  ${activeStep===step ? "bg-yellow-400 text-black shadow-md" : "bg-transparent border border-yellow-700 text-yellow-200"}
                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={disabled}
              >
                {step===1?"1 - Chọn bắp nước":step===2?"2 - Thông tin khách hàng":step===3?"3 - Thanh toán":"4 - Xác nhận"}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {activeStep === 1 && (
                <SelectComboStep
                  selectedCombos={selectedCombos}
                  setSelectedCombos={setSelectedCombos}
                  onNext={() => handleNextStep(2)}
                  movieId={booking.movieId}
                />
              )}
              {activeStep === 2 && (
                <CustomerInfoStep
                  customer={customer}
                  setCustomer={setCustomer}
                  onNext={() => handleNextStep(3)}
                  onPrev={() => setActiveStep(1)}
                  userLoggedIn={userLoggedIn}
                />
              )}
              {activeStep === 3 && (
                <PaymentStep
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  appliedPromo={appliedPromo}
                  onApplyPromo={handleApplyPromo}
                  onNext={() => handleNextStep(4)}
                  onPrev={() => setActiveStep(2)}
                />
              )}
              {activeStep === 4 && (
                <ConfirmStep
                  booking={booking}
                  comboTotal={comboTotal}
                  finalTotal={finalTotal}
                  appliedPromo={appliedPromo}
                  discountValue={discountValue}
                  onPrev={() => setActiveStep(3)}
                  onConfirm={handleConfirmPayment}
                />
              )}
            </AnimatePresence>
          </div>

          <BookingSummary
            booking={booking}
            selectedCombos={selectedCombos}
            comboTotal={comboTotal}
            appliedPromo={appliedPromo}
            discountValue={discountValue}
            finalTotal={finalTotal}
            goToStep={handleNextStep}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
