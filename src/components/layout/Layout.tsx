import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="pt-16">
        {children}
        <Footer />
      </main>
    </div>
  );
};

export default Layout;
