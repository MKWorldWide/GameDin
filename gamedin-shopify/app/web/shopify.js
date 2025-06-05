import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-07";

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
  "My Shopify One-Time Charge": {
    // This is an example price point, in the app, this would be replaced with a price point that can be changed in the .env
    amount: 5.0,
    currencyCode: "USD",
    interval: "ONE_TIME",
  },
};

// Initialize SQLite session storage
const DB_PATH = `${process.cwd()}/database.sqlite`;
const sessionStorage = new SQLiteSessionStorage(DB_PATH);

// Initialize Shopify app
const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    billing: undefined, // or replace with billing config if needed
  },
  auth: {
    path: "/auth",
    callbackPath: "/auth/callback",
  },
  webhooks: {
    path: "/webhooks",
  },
  // This should be replaced with your preferred storage strategy
  sessionStorage,
});

export default shopify; 