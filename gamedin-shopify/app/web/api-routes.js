/**
 * API Routes for GameDin Shopify App
 * 
 * This file defines the API endpoints for the GameDin Shopify app.
 * These endpoints are used by the frontend to interact with Shopify and custom functionality.
 */

import express from "express";
import { Shopify } from "@shopify/shopify-api";

const router = express.Router();

// Middleware to parse JSON request bodies
router.use(express.json());

/**
 * Get shop information
 */
router.get("/shop", async (req, res) => {
  const session = res.locals.shopify.session;
  
  try {
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    const response = await client.get({
      path: "shop",
    });
    
    res.status(200).send(response.body);
  } catch (error) {
    console.error(`Error fetching shop info: ${error.message}`);
    res.status(500).send({ error: error.message });
  }
});

/**
 * Get products with GameDin-specific data
 */
router.get("/products", async (req, res) => {
  const session = res.locals.shopify.session;
  const { limit = 10, page = 1, collection_id, query } = req.query;
  
  try {
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    
    // Build query parameters
    const params = {
      limit: parseInt(limit),
      fields: "id,title,handle,status,images,variants,product_type,tags,created_at,updated_at",
    };
    
    if (page > 1) {
      params.page = parseInt(page);
    }
    
    if (collection_id) {
      params.collection_id = collection_id;
    }
    
    if (query) {
      params.query = query;
    }
    
    // Fetch products
    const response = await client.get({
      path: "products",
      query: params,
    });
    
    // Fetch GameDin-specific metafields for each product
    const productsWithMetafields = await Promise.all(
      response.body.products.map(async (product) => {
        try {
          const metafieldsResponse = await client.get({
            path: `products/${product.id}/metafields`,
            query: {
              namespace: "gamedin",
            },
          });
          
          return {
            ...product,
            gamedin_metafields: metafieldsResponse.body.metafields,
          };
        } catch (error) {
          console.error(`Error fetching metafields for product ${product.id}: ${error.message}`);
          return {
            ...product,
            gamedin_metafields: [],
          };
        }
      })
    );
    
    res.status(200).send({
      products: productsWithMetafields,
      pagination: {
        limit: parseInt(limit),
        current_page: parseInt(page),
        has_next: response.body.products.length === parseInt(limit),
      },
    });
  } catch (error) {
    console.error(`Error fetching products: ${error.message}`);
    res.status(500).send({ error: error.message });
  }
});

/**
 * Get a single product with GameDin-specific data
 */
router.get("/products/:id", async (req, res) => {
  const session = res.locals.shopify.session;
  const { id } = req.params;
  
  try {
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    
    // Fetch product
    const productResponse = await client.get({
      path: `products/${id}`,
    });
    
    // Fetch GameDin-specific metafields
    const metafieldsResponse = await client.get({
      path: `products/${id}/metafields`,
      query: {
        namespace: "gamedin",
      },
    });
    
    // Combine product with metafields
    const productWithMetafields = {
      ...productResponse.body.product,
      gamedin_metafields: metafieldsResponse.body.metafields,
    };
    
    res.status(200).send({ product: productWithMetafields });
  } catch (error) {
    console.error(`Error fetching product ${id}: ${error.message}`);
    res.status(500).send({ error: error.message });
  }
});

/**
 * Get game recommendations for a product
 */
router.get("/products/:id/recommendations", async (req, res) => {
  const session = res.locals.shopify.session;
  const { id } = req.params;
  
  try {
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    
    // Fetch GameDin-specific recommendations metafield
    const metafieldsResponse = await client.get({
      path: `products/${id}/metafields`,
      query: {
        namespace: "gamedin",
        key: "recommended_games",
      },
    });
    
    // Check if recommendations exist
    if (metafieldsResponse.body.metafields.length === 0) {
      return res.status(200).send({ recommendations: [] });
    }
    
    // Parse recommendations from metafield
    const recommendationsMetafield = metafieldsResponse.body.metafields[0];
    let recommendedProductIds = [];
    
    try {
      recommendedProductIds = JSON.parse(recommendationsMetafield.value);
    } catch (error) {
      console.error(`Error parsing recommendations for product ${id}: ${error.message}`);
      return res.status(200).send({ recommendations: [] });
    }
    
    // Fetch recommended products
    if (recommendedProductIds.length === 0) {
      return res.status(200).send({ recommendations: [] });
    }
    
    // Fetch each recommended product
    const recommendedProducts = await Promise.all(
      recommendedProductIds.map(async (productId) => {
        try {
          const response = await client.get({
            path: `products/${productId}`,
            query: {
              fields: "id,title,handle,images,variants,product_type",
            },
          });
          
          return response.body.product;
        } catch (error) {
          console.error(`Error fetching recommended product ${productId}: ${error.message}`);
          return null;
        }
      })
    );
    
    // Filter out any null products (failed fetches)
    const validRecommendations = recommendedProducts.filter(Boolean);
    
    res.status(200).send({ recommendations: validRecommendations });
  } catch (error) {
    console.error(`Error fetching recommendations for product ${id}: ${error.message}`);
    res.status(500).send({ error: error.message });
  }
});

/**
 * Get customer game lists
 */
router.get("/customers/:id/game-lists", async (req, res) => {
  const session = res.locals.shopify.session;
  const { id } = req.params;
  
  try {
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    
    // Fetch all customer metafields
    const metafieldsResponse = await client.get({
      path: `customers/${id}/metafields`,
      query: {
        namespace: "gamedin",
      },
    });
    
    // Filter for game list metafields
    const gameListMetafields = metafieldsResponse.body.metafields.filter(
      (metafield) => metafield.key.startsWith("game_list_")
    );
    
    // Parse game lists from metafields
    const gameLists = gameListMetafields.map((metafield) => {
      try {
        return JSON.parse(metafield.value);
      } catch (error) {
        console.error(`Error parsing game list metafield ${metafield.key}: ${error.message}`);
        return null;
      }
    }).filter(Boolean);
    
    res.status(200).send({ game_lists: gameLists });
  } catch (error) {
    console.error(`Error fetching game lists for customer ${id}: ${error.message}`);
    res.status(500).send({ error: error.message });
  }
});

/**
 * Get product reviews
 */
router.get("/products/:id/reviews", async (req, res) => {
  const session = res.locals.shopify.session;
  const { id } = req.params;
  
  try {
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    
    // Fetch reviews metafield
    const metafieldsResponse = await client.get({
      path: `products/${id}/metafields`,
      query: {
        namespace: "gamedin",
        key: "reviews",
      },
    });
    
    // Check if reviews exist
    if (metafieldsResponse.body.metafields.length === 0) {
      return res.status(200).send({ reviews: [] });
    }
    
    // Parse reviews from metafield
    const reviewsMetafield = metafieldsResponse.body.metafields[0];
    let reviews = [];
    
    try {
      reviews = JSON.parse(reviewsMetafield.value);
    } catch (error) {
      console.error(`Error parsing reviews for product ${id}: ${error.message}`);
      return res.status(200).send({ reviews: [] });
    }
    
    res.status(200).send({ reviews });
  } catch (error) {
    console.error(`Error fetching reviews for product ${id}: ${error.message}`);
    res.status(500).send({ error: error.message });
  }
});

/**
 * Get analytics data
 */
router.get("/analytics", async (req, res) => {
  const session = res.locals.shopify.session;
  const { period = "last_30_days" } = req.query;
  
  try {
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    
    // Fetch orders for the specified period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case "last_7_days":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "last_30_days":
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case "last_90_days":
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30));
    }
    
    const formattedStartDate = startDate.toISOString();
    
    // Fetch orders
    const ordersResponse = await client.get({
      path: "orders",
      query: {
        status: "any",
        created_at_min: formattedStartDate,
        fields: "id,created_at,total_price,line_items",
      },
    });
    
    // Process orders to extract analytics data
    const orders = ordersResponse.body.orders;
    
    // Calculate total sales
    const totalSales = orders.reduce((sum, order) => {
      return sum + parseFloat(order.total_price);
    }, 0);
    
    // Count total games sold
    const totalGamesSold = orders.reduce((sum, order) => {
      return sum + order.line_items.reduce((itemSum, item) => {
        return itemSum + item.quantity;
      }, 0);
    }, 0);
    
    // Count unique customers
    const uniqueCustomerIds = new Set(orders.map(order => order.customer?.id).filter(Boolean));
    
    // Get top selling games
    const gamesSoldMap = {};
    orders.forEach(order => {
      order.line_items.forEach(item => {
        const productId = item.product_id;
        if (!productId) return;
        
        if (!gamesSoldMap[productId]) {
          gamesSoldMap[productId] = {
            id: productId,
            title: item.title,
            quantity: 0,
            revenue: 0,
          };
        }
        
        gamesSoldMap[productId].quantity += item.quantity;
        gamesSoldMap[productId].revenue += parseFloat(item.price) * item.quantity;
      });
    });
    
    const topSellingGames = Object.values(gamesSoldMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    res.status(200).send({
      period,
      total_sales: totalSales.toFixed(2),
      total_games_sold: totalGamesSold,
      unique_customers: uniqueCustomerIds.size,
      top_selling_games: topSellingGames,
      order_count: orders.length,
    });
  } catch (error) {
    console.error(`Error fetching analytics: ${error.message}`);
    res.status(500).send({ error: error.message });
  }
});

export default router; 