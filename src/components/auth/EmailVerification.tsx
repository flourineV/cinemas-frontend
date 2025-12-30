import React, { useState, useEffect } from "react";
import { Mail, Clock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext";
import { emailVerificationService } from "../../services/auth/emailVerificationService";

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerified,
  onBack,
}) => {
  const { t } = useLanguage();
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError(t("auth.verification.codeInvalid"));
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await emailVerificationService.verifyEmail({
        email,
        verificationCode: verificationCode.trim(),
      });

      setSuccess(t("auth.verification.success"));
      setTimeout(() => {
        onVerified();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || t("auth.verification.failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      await emailVerificationService.sendVerificationCode({ email });
      setSuccess(t("auth.verification.resent"));
      setTimeLeft(600);
      setCanResend(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message || t("auth.verification.resendFailed")
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(value);
    if (error) setError("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 relative">
        {/* Back Button - Top Left */}
        <button
          type="button"
          onClick={onBack}
          className="absolute top-4 left-4 flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6 pt-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("auth.verification.title")}
          </h2>
          <p className="text-gray-600 text-sm">
            {t("auth.verification.subtitle")}
          </p>
          <p className="text-yellow-600 font-medium mt-2">{email}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          {/* Verification Code Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("auth.verification.codeLabel")}
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={handleCodeChange}
              placeholder="000000"
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
              maxLength={6}
              autoComplete="one-time-code"
            />
            <p className="text-xs text-gray-500 mt-1 text-center">
              {t("auth.verification.codeHint")}
            </p>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {timeLeft > 0 ? (
                <>
                  {t("auth.verification.expiresIn")} {formatTime(timeLeft)}
                </>
              ) : (
                <span className="text-red-500">
                  {t("auth.verification.expired")}
                </span>
              )}
            </span>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  {t("auth.verification.verifying")}
                </>
              ) : (
                t("auth.verification.verify")
              )}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || resendLoading}
              className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {resendLoading
                ? t("auth.verification.resending")
                : t("auth.verification.resend")}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EmailVerification;
