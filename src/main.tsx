import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ProgressProvider } from "./state/progressStore";
import { SettingsProvider } from "./state/settingsStore";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SettingsProvider>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </SettingsProvider>
  </StrictMode>
);
