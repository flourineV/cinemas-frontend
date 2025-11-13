import { BrowserRouter } from "react-router-dom";
import AppRouter from "@/routes/AppRouter";
import ScrollToTop from "@/components/common/ScrollToTop";
import "./styles/globals.css";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
