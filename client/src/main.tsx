import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// URL pública de tu backend en Railway
const API_BASE_URL = "https://certigo-app-production.up.railway.app";

// Detecta si la app corre empaquetada (APK), no en el navegador
const isNativeApp = !!(window as any).Capacitor?.isNativePlatform?.();

if (isNativeApp) {
  const originalFetch = window.fetch;

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    let url = typeof input === "string" ? input : input.toString();

    // Caso 1: ruta relativa, ej. "/api/bookings"
    if (url.startsWith("/api")) {
      return originalFetch(API_BASE_URL + url, init);
    }

    // Caso 2: URL absoluta apuntando al WebView local, ej. "https://localhost/api/bookings"
    try {
      const parsed = new URL(url);
      if (parsed.pathname.startsWith("/api")) {
        return originalFetch(API_BASE_URL + parsed.pathname + parsed.search, init);
      }
    } catch {
      // no es una URL válida, la dejamos igual (ej. solicitudes a Cloudinary)
    }

    return originalFetch(input, init);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
