import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./components/common/Icon";
import { ToastProvider } from "./components/common";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <ToastProvider />
  </StrictMode>,
);
