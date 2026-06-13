import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./styles/site.css";
import App from "./App";

// Must run before React renders: the browser's deferred scroll restoration
// otherwise fights smooth scrolling and the pinned intro.
history.scrollRestoration = "manual";
window.scrollTo(0, 0);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
