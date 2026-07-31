import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// The static #splash (index.html) is now handed off to React's <LoadingScreen>
// inside App, once the loading screen has actually painted — see App.tsx.

