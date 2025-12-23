import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { paymentService } from "@/services/payment/payment.service";
import Layout from "@/components/layout/Layout";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Lấy appTransId từ URL params (ZaloPay redirect sẽ có param này)
        const appTransId = searchParams.get("apptransid");

        if (!appTransId) {
          setStatus("failed");
          setMessage(t("payment.noTransaction"));
          return;
        }

        // Gọi API check status
        const response =
          await paymentService.checkTransactionStatus(appTransId);

        if (response.isSuccess && response.returnCode === 1) {
          setStatus("success");
          setMessage(t("payment.success"));

          // Phân biệt loại payment để redirect đúng tab
          // Check nếu có type parameter hoặc appTransId có pattern FnB
          const paymentType = searchParams.get("type");
          const isFnbPayment =
            paymentType === "fnb" ||
            appTransId.toLowerCase().includes("fnb") ||
            appTransId.toLowerCase().includes("popcorn");

          // Redirect về trang phù hợp sau 3 giây với state để force refresh
          setTimeout(() => {
            if (isFnbPayment) {
              navigate("/profile?tab=fnb", { state: { refresh: Date.now() } });
            } else {
              navigate("/profile?tab=bookings", {
                state: { refresh: Date.now() },
              });
            }
          }, 3000);
        } else {
          setStatus("failed");
          setMessage(response.returnMessage || t("payment.notCompleted"));
          // Backend đã tự động xử lý cancel booking và unlock ghế qua PaymentBookingFailedEvent
        }
      } catch (error: any) {
        console.error("Error checking payment status:", error);
        setStatus("failed");
        setMessage(error.message || t("payment.checkError"));
      }
    };

    checkPaymentStatus();
  }, [searchParams, navigate, t]);

  const isFnbPayment = (() => {
    const paymentType = searchParams.get("type");
    const appTransId = searchParams.get("apptransid") || "";
    return (
      paymentType === "fnb" ||
      appTransId.toLowerCase().includes("fnb") ||
      appTransId.toLowerCase().includes("popcorn")
    );
  })();

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-zinc-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          {status === "loading" && (
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-yellow-400 animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                {t("payment.processing")}
              </h1>
              <p className="text-gray-400">{t("payment.pleaseWait")}</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">{message}</h1>
              <p className="text-gray-400 mb-2">{t("payment.thankYou")}</p>
              {!isFnbPayment && (
                <div className="flex items-center justify-center gap-2 text-yellow-400 mb-4">
                  <Mail className="w-4 h-4" />
                  <p className="text-sm">{t("payment.emailSent")}</p>
                </div>
              )}
              <p className="text-sm text-gray-500">
                {isFnbPayment
                  ? t("payment.redirectFnb")
                  : t("payment.redirectBookings")}
              </p>
            </div>
          )}

          {status === "failed" && (
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                {t("payment.failed")}
              </h1>
              <p className="text-gray-400 mb-6">{message}</p>
              <div className="flex justify-center">
                <button
                  onClick={() => navigate("/")}
                  className="bg-yellow-500 text-black font-semibold px-6 py-2 rounded-md hover:bg-yellow-400 transition"
                >
                  {t("payment.backHome")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PaymentResult;
