import React, { useState } from "react";
import { Mail, AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext";
import { emailVerificationService } from "../../services/auth/emailVerificationService";
import EmailVerification from "./EmailVerification";

interface EmailVerificationRequiredProps {
  email: string;
  onBack: () => void;
  onVerified: () => void;
}

const EmailVerificationRequired: React.FC<EmailVerificationRequiredProps> = ({
  email,
  onBack,
  onVerified,
}) => {
  const { t } = useLanguage();
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendVerification = async () => {
    setLoading(true);
    setError("");

    try {
      await emailVerificationService.sendVerificationCode({ email });
      setShowVerification(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message || t("auth.verification.sendFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerified = () => {
    setShowVerification(false);
    onVerified();
  };

  const handleBackFromVerification = () => {
    setShowVerification(false);
  };

  if (showVerification) {
    return (
      <EmailVerification
        email={email}
        onVerified={handleVerified}
        onBack={handleBackFromVerification}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("auth.verification.required.title")}
          </h2>
          <p className="text-gray-600 text-sm">
            {t("auth.verification.required.subtitle")}
          </p>
          <p className="text-red-600 font-medium mt-2">{email}</p>
        </div>

        {/* Description */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">
                {t("auth.verification.required.reason")}
              </p>
              <p>{t("auth.verification.required.instruction")}</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleSendVerification}
            disabled={loading}
            className="w-full bg-yellow-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("auth.verification.required.sending")}
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                {t("auth.verification.required.sendCode")}
              </>
            )}
          </button>

          <button
            onClick={onBack}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("auth.verification.required.backToLogin")}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {t("auth.verification.required.helpText")}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default EmailVerificationRequired;
