import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import EmailVerificationBanner from "../auth/EmailVerificationBanner";
import { useEmailVerification } from "../../hooks/useEmailVerification";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { navigateToVerification } = useEmailVerification();

  const handleVerifyClick = () => {
    navigateToVerification();
  };

  return (
    <div className="min-h-screen w-full">
      <Header />
      <EmailVerificationBanner onVerifyClick={handleVerifyClick} />
      <main className="pt-16">
        {children}
        <Footer />
      </main>
    </div>
  );
};

export default Layout;
