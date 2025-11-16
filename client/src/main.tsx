import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import { initializeAnalytics } from "./lib/initAnalytics";

// Initialize analytics (Facebook Pixel from environment variables)
// GTM is initialized via script tag in index.html
initializeAnalytics();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
