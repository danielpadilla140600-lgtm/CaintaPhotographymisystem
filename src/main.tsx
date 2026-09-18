import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Automatically prefix /api/ calls with VITE_API_BASE_URL when frontend is hosted separately (e.g. Firebase Hosting -> Render Backend)
const rawApiBase = String((import.meta as any).env?.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");
if (rawApiBase) {
  const apiOrigin = rawApiBase.endsWith("/api") ? rawApiBase.slice(0, -4) : rawApiBase;
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === "string" && input.startsWith("/api/")) {
      input = `${apiOrigin}${input}`;
    }
    return originalFetch(input, init);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
