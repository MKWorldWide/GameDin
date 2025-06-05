/**
 * Webhook Handlers for Shopify Events
 * 
 * This file contains handlers for various Shopify webhook events.
 * Each handler is responsible for processing a specific type of event.
 */

import { DeliveryMethod } from "@shopify/shopify-api";

/**
 * Handler for app uninstallation events
 */
const appUninstallHandler = async (topic, shop, body) => {
  console.log(`App uninstalled by shop: ${shop}`);
  // Clean up any app data associated with this shop
  // This could include removing database records, etc.
};

/**
 * Handler for product creation events
 */
const productCreateHandler = async (topic, shop, body) => {
  const product = JSON.parse(body);
  console.log(`New product created in shop ${shop}: ${product.title}`);
  
  // Process the new product
  // This could include adding GameDin-specific metafields, etc.
};

/**
 * Handler for product update events
 */
const productUpdateHandler = async (topic, shop, body) => {
  const product = JSON.parse(body);
  console.log(`Product updated in shop ${shop}: ${product.title}`);
  
  // Process the updated product
  // This could include updating GameDin-specific data, etc.
};

/**
 * Handler for order creation events
 */
const orderCreateHandler = async (topic, shop, body) => {
  const order = JSON.parse(body);
  console.log(`New order created in shop ${shop}: ${order.name}`);
  
  // Process the new order
  // This could include updating game analytics, etc.
};

/**
 * Handler for customer creation events
 */
const customerCreateHandler = async (topic, shop, body) => {
  const customer = JSON.parse(body);
  console.log(`New customer created in shop ${shop}: ${customer.email}`);
  
  // Process the new customer
  // This could include setting up GameDin-specific customer data, etc.
};

/**
 * Handler for customer data request events (GDPR)
 */
const customersDataRequestHandler = async (topic, shop, body) => {
  const data = JSON.parse(body);
  console.log(`Customer data request received for shop ${shop}`);
  
  // Handle GDPR data request
  // This should compile all customer data and make it available for export
};

/**
 * Handler for customer data erasure events (GDPR)
 */
const customersRedactHandler = async (topic, shop, body) => {
  const data = JSON.parse(body);
  console.log(`Customer data erasure request received for shop ${shop}`);
  
  // Handle GDPR data erasure request
  // This should remove all customer data as required by GDPR
};

/**
 * Handler for shop data erasure events (GDPR)
 */
const shopRedactHandler = async (topic, shop, body) => {
  const data = JSON.parse(body);
  console.log(`Shop data erasure request received for shop ${shop}`);
  
  // Handle GDPR shop data erasure request
  // This should remove all shop data as required by GDPR
};

// Export all webhook handlers
export default {
  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/webhooks",
    callback: appUninstallHandler,
  },
  PRODUCTS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/webhooks",
    callback: productCreateHandler,
  },
  PRODUCTS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/webhooks",
    callback: productUpdateHandler,
  },
  ORDERS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/webhooks",
    callback: orderCreateHandler,
  },
  CUSTOMERS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/webhooks",
    callback: customerCreateHandler,
  },
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/webhooks",
    callback: customersDataRequestHandler,
  },
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/webhooks",
    callback: customersRedactHandler,
  },
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/webhooks",
    callback: shopRedactHandler,
  },
}; 