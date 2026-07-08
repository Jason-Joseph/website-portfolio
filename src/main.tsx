import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Self-hosted fonts (was a render-blocking Google Fonts request chain —
// the site's main LCP cost). Only the weights the CSS actually uses.
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/playfair-display/500-italic.css";
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
