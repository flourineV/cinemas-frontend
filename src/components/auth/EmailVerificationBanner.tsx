import React, { useState, useEffect } from "react";
import { AlertTriangle, Mail, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuthStore } from "../../stores/authStore";

interface EmailVerificationBannerProps {
  onVerifyClick: () => void;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
  onVerifyClick,
}) => {
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkEmailVerification = () => {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }

      // Check if banner was dismissed in this session
      const dismissedKey = `email-verification-dismissed-${user.email}`;
      if (sessionStorage.getItem(dismissedKey)) {
        setIsDismissed(true);
        setIsLoading(false);
        return;
      }

      // Check user's emailVerified status from auth store
      setIsVisible(!user.emailVerified);
      setIsLoading(false);
    };

    checkEmailVerification();
  }, [user?.email, user?.emailVerified]);

  const handleDismiss = () => {
    if (user?.email) {
      const dismissedKey = `email-verification-dismissed-${user.email}`;
      sessionStorage.setItem(dismissedKey, "true");
    }
    setIsDismissed(true);
  };

  const handleVerifyClick = () => {
    onVerifyClick();
  };

  if (isLoading || !isVisible || isDismissed || !user) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  {t("auth.verification.banner.title")}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  {t("auth.verification.banner.subtitle")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleVerifyClick}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Mail className="w-4 h-4" />
                {t("auth.verification.banner.verify")}
              </button>

              <button
                onClick={handleDismiss}
                className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
                title={t("auth.verification.banner.dismiss")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmailVerificationBanner;
