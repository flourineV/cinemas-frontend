import { BrowserRouter } from "react-router-dom";
import AppRouter from "@/routes/AppRouter";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { GuestSessionProvider } from "@/contexts/GuestSessionContext";
import "./styles/globals.css";

function App() {
  return (
    <BrowserRouter>
      <GuestSessionProvider>
        <ScrollToTop />
        <AppRouter />
      </GuestSessionProvider>
    </BrowserRouter>
  );
}

export default App;
