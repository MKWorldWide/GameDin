// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import shopify from "./shopify.js";
import webhookHandlers from "./webhook-handlers.js";
import apiRoutes from "./api-routes.js";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "8081", 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors());
app.use(compression());

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

// API routes
app.use("/api", shopify.validateAuthenticatedSession(), apiRoutes);

// Serve static assets
app.use(serveStatic(STATIC_PATH, { index: false }));

// Serve the React app for all other routes
app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 