import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Ordem importa: tokens/base → componentes → cenas animadas do clima
import "./styles/global.css";
import "./styles/components.css";
import "./styles/weather-scenes.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
