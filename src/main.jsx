// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// estilos (Tailwind)
import "./index.css";

// ========================
// React Query Client
// ========================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ========================
// Render
// ========================
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider className="font-sans">
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
