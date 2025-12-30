import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "../../components/layout/Layout";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuthStore } from "../../stores/authStore";
import EmailVerification from "../../components/auth/EmailVerification";
import { emailVerificationService } from "../../services/auth/emailVerificationService";

const EmailVerificationPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signup } = useAuthStore();
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "signup" | "profile">("profile");

  useEffect(() => {
    const initializePage = async () => {
      // Get email from URL params or user object
      const emailParam = searchParams.get("email");
      const userEmail = user?.email;
      const modeParam =
        (searchParams.get("mode") as "login" | "signup" | "profile") ||
        "profile";

      setMode(modeParam);

      if (!emailParam && !userEmail) {
        navigate("/auth");
        return;
      }

      const targetEmail = emailParam || userEmail!;
      setEmail(targetEmail);

      // Check if email is already verified
      try {
        const status =
          await emailVerificationService.checkEmailStatus(targetEmail);
        if (status.verified) {
          setIsVerified(true);
        } else {
          // Send verification code automatically only once
          await emailVerificationService.sendVerificationCode({
            email: targetEmail,
          });
        }
      } catch (error) {
        console.error("Failed to check email status:", error);
        // If status check fails, try to send verification code only if we haven't tried yet
        if (!sessionStorage.getItem(`otp-sent-${targetEmail}`)) {
          try {
            await emailVerificationService.sendVerificationCode({
              email: targetEmail,
            });
            // Mark that we've sent OTP for this email
            sessionStorage.setItem(`otp-sent-${targetEmail}`, "true");
          } catch (sendErr) {
            console.error("Failed to send verification code:", sendErr);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [searchParams, user, navigate]);

  const handleVerified = async () => {
    setIsVerified(true);

    // Clear any dismissed banners for this email
    if (email) {
      const dismissedKey = `email-verification-dismissed-${email}`;
      sessionStorage.removeItem(dismissedKey);
      // Clear OTP sent flag
      sessionStorage.removeItem(`otp-sent-${email}`);
    }

    // Handle based on mode
    if (mode === "signup") {
      // Get pending signup data and complete registration
      const pendingDataStr = sessionStorage.getItem("pendingSignupData");
      console.log("📝 Pending signup data:", pendingDataStr);
      if (pendingDataStr) {
        try {
          const pendingData = JSON.parse(pendingDataStr);
          console.log("📝 Parsed pending data:", pendingData);
          sessionStorage.removeItem("pendingSignupData");
          console.log("🔄 Calling signup...");
          await signup(pendingData);
          console.log("✅ Signup completed, redirecting to home...");
          // Redirect to home after successful signup
          navigate("/");
          return;
        } catch (err) {
          console.error("❌ Failed to complete signup:", err);
        }
      } else {
        console.warn("⚠️ No pending signup data found in sessionStorage");
      }
    }

    // Redirect after success
    setTimeout(() => {
      const returnUrl = searchParams.get("returnUrl") || "/";
      if (mode === "login") {
        // Go back to auth page to login again
        navigate("/auth");
      } else {
        navigate(returnUrl);
      }
    }, 2000);
  };

  const handleBack = () => {
    // Clear pending signup data if going back
    sessionStorage.removeItem("pendingSignupData");
    const returnUrl = searchParams.get("returnUrl") || "/auth";
    navigate(returnUrl);
  };

  if (loading) {
    return (
      <Layout>
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950 py-28 px-4">
          {/* BACKGROUND */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: "url('/background_profile.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          </div>
          <div className="relative z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isVerified) {
    return (
      <Layout>
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950 py-28 px-4">
          {/* BACKGROUND */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: "url('/background_profile.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-md mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t("auth.verification.alreadyVerified.title")}
              </h2>
              <p className="text-gray-600 mb-6">
                {mode === "login"
                  ? t("auth.verification.loginAgain")
                  : t("auth.verification.alreadyVerified.subtitle")}
              </p>
              <button
                onClick={handleBack}
                className="w-full bg-zinc-900 text-yellow-400 py-3 px-4 rounded-xl font-bold hover:bg-black transition-colors"
              >
                {mode === "login"
                  ? t("auth.verification.backToLogin")
                  : t("auth.verification.alreadyVerified.continue")}
              </button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950 py-28 px-4">
        {/* BACKGROUND */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/background_profile.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto">
          {/* Email Verification Component */}
          <EmailVerification
            email={email}
            onVerified={handleVerified}
            onBack={handleBack}
          />
        </div>
      </div>
    </Layout>
  );
};

export default EmailVerificationPage;
