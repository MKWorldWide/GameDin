import React from "react";
import { createRoot } from "react-dom/client";
import { PolarisVizProvider } from "@shopify/polaris-viz";
import App from "./App";

import "./index.css";
import "@shopify/polaris/build/esm/styles.css";

// Create root and render app
const container = document.getElementById("app");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <PolarisVizProvider>
      <App />
    </PolarisVizProvider>
  </React.StrictMode>
); 