/**
 * Content Migration Module
 * 
 * Handles migration of user-generated content like reviews, lists, and ratings
 */

const AWS = require('aws-sdk');
const Shopify = require('@shopify/shopify-api');
const fs = require('fs');
const path = require('path');

// Constants
const LOG_FILE = path.resolve(__dirname, '../logs/content-migration.log');
const USER_MAPPING_FILE = path.resolve(__dirname, '../data/user-mapping.json');
const PRODUCT_MAPPING_FILE = path.resolve(__dirname, '../data/product-mapping.json');
const CONTENT_MAPPING_FILE = path.resolve(__dirname, '../data/content-mapping.json');

// Ensure directories exist
fs.mkdirSync(path.resolve(__dirname, '../logs'), { recursive: true });
fs.mkdirSync(path.resolve(__dirname, '../data'), { recursive: true });

// Logging function
function logMessage(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, formattedMessage);
  return formattedMessage;
}

/**
 * Initialize AWS and Shopify connections
 */
function initialize(options) {
  // Setup AWS
  if (options.awsProfile) {
    const credentials = new AWS.SharedIniFileCredentials({ profile: options.awsProfile });
    AWS.config.credentials = credentials;
  }

  // Configure AWS from environment if no profile specified
  AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });

  // Setup Shopify
  const shopifyStore = options.shopifyStore || process.env.SHOPIFY_SHOP;
  const shopifyApiKey = process.env.SHOPIFY_API_KEY;
  const shopifyApiSecret = process.env.SHOPIFY_API_SECRET;
  const shopifyScopes = process.env.SHOPIFY_API_SCOPES.split(',');

  if (!shopifyStore || !shopifyApiKey || !shopifyApiSecret) {
    throw new Error('Missing required Shopify credentials. Check your environment variables.');
  }

  // Initialize Shopify API client
  Shopify.Context.initialize({
    API_KEY: shopifyApiKey,
    API_SECRET_KEY: shopifyApiSecret,
    SCOPES: shopifyScopes,
    HOST_NAME: shopifyStore.replace(/https?:\/\//, ''),
    IS_EMBEDDED_APP: true,
    API_VERSION: '2023-07', // Update with current Shopify API version
  });

  // Create clients
  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  
  return { dynamoDB };
}

/**
 * Load user and product mappings
 */
function loadMappings() {
  const mappings = {
    users: [],
    products: []
  };

  try {
    if (fs.existsSync(USER_MAPPING_FILE)) {
      const userData = fs.readFileSync(USER_MAPPING_FILE, 'utf8');
      mappings.users = JSON.parse(userData);
      logMessage(`Loaded ${mappings.users.length} user mappings`);
    } else {
      logMessage('No user mapping file found. User-specific content will be skipped.', 'warning');
    }

    if (fs.existsSync(PRODUCT_MAPPING_FILE)) {
      const productData = fs.readFileSync(PRODUCT_MAPPING_FILE, 'utf8');
      mappings.products = JSON.parse(productData);
      logMessage(`Loaded ${mappings.products.length} product mappings`);
    } else {
      logMessage('No product mapping file found. Product-specific content will be skipped.', 'warning');
    }

    return mappings;
  } catch (error) {
    logMessage(`Error loading mappings: ${error.message}`, 'error');
    return mappings;
  }
}

/**
 * Fetch reviews from AWS DynamoDB
 */
async function fetchReviews(dynamoDB, options) {
  try {
    const tableName = process.env.AWS_DYNAMODB_REVIEWS_TABLE;
    if (!tableName) {
      throw new Error('AWS_DYNAMODB_REVIEWS_TABLE environment variable not set');
    }

    let reviews = [];
    let lastEvaluatedKey = null;

    do {
      const params = {
        TableName: tableName,
        Limit: 50
      };

      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }

      const response = await dynamoDB.scan(params).promise();
      reviews = reviews.concat(response.Items);
      lastEvaluatedKey = response.LastEvaluatedKey;

      logMessage(`Fetched ${response.Items.length} reviews from DynamoDB. Total: ${reviews.length}`);
      
      // For dry runs, limit the number of entries to speed up testing
      if (options.dryRun && reviews.length >= 20) {
        logMessage('Dry run mode - limiting to 20 reviews for testing');
        break;
      }
    } while (lastEvaluatedKey);

    return reviews;
  } catch (error) {
    logMessage(`Error fetching reviews: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Fetch game lists from AWS DynamoDB
 */
async function fetchGameLists(dynamoDB, options) {
  try {
    const tableName = process.env.AWS_DYNAMODB_LISTS_TABLE;
    if (!tableName) {
      throw new Error('AWS_DYNAMODB_LISTS_TABLE environment variable not set');
    }

    let lists = [];
    let lastEvaluatedKey = null;

    do {
      const params = {
        TableName: tableName,
        Limit: 50
      };

      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }

      const response = await dynamoDB.scan(params).promise();
      lists = lists.concat(response.Items);
      lastEvaluatedKey = response.LastEvaluatedKey;

      logMessage(`Fetched ${response.Items.length} game lists from DynamoDB. Total: ${lists.length}`);
      
      // For dry runs, limit the number of entries to speed up testing
      if (options.dryRun && lists.length >= 10) {
        logMessage('Dry run mode - limiting to 10 game lists for testing');
        break;
      }
    } while (lastEvaluatedKey);

    return lists;
  } catch (error) {
    logMessage(`Error fetching game lists: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Create a product metafield for user reviews
 */
async function createReviewMetafields(productId, reviews, session, options) {
  if (options.dryRun) {
    logMessage(`[DRY RUN] Would create review metafields for product ${productId} with ${reviews.length} reviews`);
    return { success: true };
  }

  try {
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    
    // Format reviews for storage in metafield
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      customerId: review.shopifyCustomerId,
      rating: review.rating,
      title: review.title,
      content: review.content,
      createdAt: review.createdAt || new Date().toISOString(),
      verified: review.verified || false
    }));
    
    // Create or update the reviews metafield
    const metafield = {
      namespace: 'gamedin',
      key: 'reviews',
      value: JSON.stringify(formattedReviews),
      type: 'json_string'
    };

    // Create the metafield in Shopify
    const response = await client.post({
      path: `products/${productId}/metafields`,
      data: { metafield },
      type: 'json',
    });

    logMessage(`Successfully created reviews metafield for product ${productId} with ${reviews.length} reviews`);
    return { success: true, metafieldId: response.body.metafield.id };
  } catch (error) {
    logMessage(`Error creating reviews metafield for product ${productId}: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

/**
 * Create a customer metafield for game lists
 */
async function createGameListMetafields(customerId, lists, mappings, session, options) {
  if (options.dryRun) {
    logMessage(`[DRY RUN] Would create game list metafields for customer ${customerId} with ${lists.length} lists`);
    return { success: true };
  }

  try {
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    
    // Process each list
    for (const list of lists) {
      try {
        // Map the game IDs to Shopify product IDs
        const shopifyGameIds = (list.games || []).map(gameId => {
          const mapping = mappings.products.find(p => p.originalId === gameId);
          return mapping ? mapping.shopifyProductId : null;
        }).filter(Boolean);
        
        // Format the list for storage
        const formattedList = {
          id: list.id,
          title: list.title,
          description: list.description,
          isPublic: list.isPublic || false,
          createdAt: list.createdAt || new Date().toISOString(),
          updatedAt: list.updatedAt || new Date().toISOString(),
          games: shopifyGameIds
        };
        
        // Create the metafield
        const metafield = {
          namespace: 'gamedin',
          key: `game_list_${list.id.replace(/[^a-zA-Z0-9]/g, '_')}`,
          value: JSON.stringify(formattedList),
          type: 'json_string'
        };
        
        // Create the metafield in Shopify
        await client.post({
          path: `customers/${customerId}/metafields`,
          data: { metafield },
          type: 'json',
        });
        
        logMessage(`Successfully created game list metafield '${list.title}' for customer ${customerId}`);
      } catch (error) {
        logMessage(`Error creating game list metafield '${list.title}' for customer ${customerId}: ${error.message}`, 'error');
      }
    }
    
    return { success: true };
  } catch (error) {
    logMessage(`Error creating game list metafields for customer ${customerId}: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

/**
 * Main migration function
 */
async function migrate(options) {
  logMessage('Starting content migration...');
  
  const result = {
    processed: {
      reviews: 0,
      lists: 0
    },
    success: {
      reviews: 0,
      lists: 0
    },
    errors: {
      reviews: 0,
      lists: 0
    },
    contentMappings: {
      reviews: []
    }
  };

  try {
    // Initialize AWS and Shopify connections
    const { dynamoDB } = initialize(options);
    
    // Get an offline session (in a real scenario, use a real authenticated session)
    const session = {
      shop: options.shopifyStore || process.env.SHOPIFY_SHOP,
      accessToken: process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN
    };

    // Load user and product mappings
    const mappings = loadMappings();
    if (mappings.products.length === 0) {
      logMessage('No product mappings found. Please run product migration first.', 'warning');
      return result;
    }

    // Fetch reviews
    const reviews = await fetchReviews(dynamoDB, options);
    logMessage(`Found ${reviews.length} reviews to migrate`);

    // Group reviews by product
    const reviewsByProduct = {};
    
    for (const review of reviews) {
      try {
        const originalProductId = review.productId || review.gameId;
        if (!originalProductId) {
          logMessage(`Skipping review without product ID: ${review.id}`, 'warning');
          continue;
        }
        
        // Find product mapping
        const productMapping = mappings.products.find(p => p.originalId === originalProductId);
        if (!productMapping) {
          logMessage(`No Shopify product found for original ID ${originalProductId}`, 'warning');
          continue;
        }
        
        const shopifyProductId = productMapping.shopifyProductId;
        
        // Find user mapping if available
        if (review.userId) {
          const userMapping = mappings.users.find(u => u.cognitoUsername === review.userId);
          if (userMapping) {
            review.shopifyCustomerId = userMapping.shopifyCustomerId;
          }
        }
        
        // Group by Shopify product ID
        if (!reviewsByProduct[shopifyProductId]) {
          reviewsByProduct[shopifyProductId] = [];
        }
        
        reviewsByProduct[shopifyProductId].push(review);
      } catch (error) {
        logMessage(`Error processing review ${review.id}: ${error.message}`, 'error');
      }
    }
    
    // Process reviews by product
    for (const [shopifyProductId, productReviews] of Object.entries(reviewsByProduct)) {
      result.processed.reviews += productReviews.length;
      
      try {
        logMessage(`Processing ${productReviews.length} reviews for product ${shopifyProductId}`);
        
        // Create reviews metafield
        const createResult = await createReviewMetafields(shopifyProductId, productReviews, session, options);
        
        if (createResult.success) {
          result.success.reviews += productReviews.length;
          
          // Store mapping
          result.contentMappings.reviews.push({
            shopifyProductId,
            metafieldId: createResult.metafieldId,
            reviewCount: productReviews.length
          });
          
          logMessage(`Successfully migrated ${productReviews.length} reviews for product ${shopifyProductId}`);
        } else {
          result.errors.reviews += productReviews.length;
          logMessage(`Failed to migrate reviews for product ${shopifyProductId}: ${createResult.error}`, 'error');
        }
      } catch (error) {
        result.errors.reviews += productReviews.length;
        logMessage(`Error migrating reviews for product ${shopifyProductId}: ${error.message}`, 'error');
      }
    }
    
    // Fetch game lists
    const gameLists = await fetchGameLists(dynamoDB, options);
    logMessage(`Found ${gameLists.length} game lists to migrate`);
    
    // Group lists by user
    const listsByUser = {};
    
    for (const list of gameLists) {
      try {
        if (!list.userId) {
          logMessage(`Skipping list without user ID: ${list.id}`, 'warning');
          continue;
        }
        
        // Find user mapping
        const userMapping = mappings.users.find(u => u.cognitoUsername === list.userId);
        if (!userMapping) {
          logMessage(`No Shopify customer found for user ID ${list.userId}`, 'warning');
          continue;
        }
        
        const shopifyCustomerId = userMapping.shopifyCustomerId;
        
        // Group by Shopify customer ID
        if (!listsByUser[shopifyCustomerId]) {
          listsByUser[shopifyCustomerId] = [];
        }
        
        listsByUser[shopifyCustomerId].push(list);
      } catch (error) {
        logMessage(`Error processing game list ${list.id}: ${error.message}`, 'error');
      }
    }
    
    // Process lists by user
    for (const [shopifyCustomerId, userLists] of Object.entries(listsByUser)) {
      result.processed.lists += userLists.length;
      
      try {
        logMessage(`Processing ${userLists.length} game lists for customer ${shopifyCustomerId}`);
        
        // Create lists metafields
        const createResult = await createGameListMetafields(shopifyCustomerId, userLists, mappings, session, options);
        
        if (createResult.success) {
          result.success.lists += userLists.length;
          logMessage(`Successfully migrated ${userLists.length} game lists for customer ${shopifyCustomerId}`);
        } else {
          result.errors.lists += userLists.length;
          logMessage(`Failed to migrate game lists for customer ${shopifyCustomerId}: ${createResult.error}`, 'error');
        }
      } catch (error) {
        result.errors.lists += userLists.length;
        logMessage(`Error migrating game lists for customer ${shopifyCustomerId}: ${error.message}`, 'error');
      }
    }
    
    // Save content mapping file
    if (!options.dryRun && result.contentMappings.reviews.length > 0) {
      fs.writeFileSync(CONTENT_MAPPING_FILE, JSON.stringify(result.contentMappings, null, 2));
      logMessage(`Content mapping saved to ${CONTENT_MAPPING_FILE}`);
    }
    
    const totalProcessed = result.processed.reviews + result.processed.lists;
    const totalSuccess = result.success.reviews + result.success.lists;
    const totalErrors = result.errors.reviews + result.errors.lists;
    
    logMessage(`Content migration completed. Processed: ${totalProcessed}, Success: ${totalSuccess}, Errors: ${totalErrors}`);
    return result;
  } catch (error) {
    logMessage(`Migration failed: ${error.message}`, 'error');
    throw error;
  }
}

module.exports = {
  migrate
}; 