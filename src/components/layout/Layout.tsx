import type { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
