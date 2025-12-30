import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Disable scroll restoration to always start at top on page load
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

// Ensure page always starts at top
window.scrollTo(0, 0);

createRoot(document.getElementById("root")!).render(<App />);
