import { BrowserRouter } from "react-router-dom";
import AppRouter from "@/routes/AppRouter";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { GuestSessionProvider } from "@/contexts/GuestSessionContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "./styles/globals.css";

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <GuestSessionProvider>
          <ScrollToTop />
          <AppRouter />
        </GuestSessionProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
