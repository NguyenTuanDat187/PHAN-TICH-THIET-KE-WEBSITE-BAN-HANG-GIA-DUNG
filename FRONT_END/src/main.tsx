import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ToastProvider } from "./components/common/index.ts";
import "./components/common/Icon";
import { CartProvider } from "./contexts/CartProvider.tsx";
import "./index.css";
import { router } from "./routes/router.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CartProvider>
      <RouterProvider router={router} />
      <ToastProvider />
    </CartProvider>
  </StrictMode>,
);
