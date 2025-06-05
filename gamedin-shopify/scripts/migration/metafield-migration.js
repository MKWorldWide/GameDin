/**
 * Metafield Migration Module
 * 
 * Handles migration of custom game data from AWS to Shopify metafields
 */

const AWS = require('aws-sdk');
const Shopify = require('@shopify/shopify-api');
const fs = require('fs');
const path = require('path');

// Constants
const LOG_FILE = path.resolve(__dirname, '../logs/metafield-migration.log');
const PRODUCT_MAPPING_FILE = path.resolve(__dirname, '../data/product-mapping.json');

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
 * Load product mappings
 */
function loadProductMappings() {
  try {
    if (fs.existsSync(PRODUCT_MAPPING_FILE)) {
      const mappingData = fs.readFileSync(PRODUCT_MAPPING_FILE, 'utf8');
      return JSON.parse(mappingData);
    }
    return [];
  } catch (error) {
    logMessage(`Error loading product mappings: ${error.message}`, 'error');
    return [];
  }
}

/**
 * Fetch game metadata from AWS DynamoDB
 */
async function fetchGameMetadata(dynamoDB, options) {
  try {
    const tableName = process.env.AWS_DYNAMODB_GAME_METADATA_TABLE;
    if (!tableName) {
      throw new Error('AWS_DYNAMODB_GAME_METADATA_TABLE environment variable not set');
    }

    let metadata = [];
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
      metadata = metadata.concat(response.Items);
      lastEvaluatedKey = response.LastEvaluatedKey;

      logMessage(`Fetched ${response.Items.length} metadata entries from DynamoDB. Total: ${metadata.length}`);
      
      // For dry runs, limit the number of entries to speed up testing
      if (options.dryRun && metadata.length >= 10) {
        logMessage('Dry run mode - limiting to 10 metadata entries for testing');
        break;
      }
    } while (lastEvaluatedKey);

    return metadata;
  } catch (error) {
    logMessage(`Error fetching game metadata: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Fetch recommendations data from AWS DynamoDB
 */
async function fetchRecommendations(dynamoDB, options) {
  try {
    const tableName = process.env.AWS_DYNAMODB_RECOMMENDATIONS_TABLE;
    if (!tableName) {
      throw new Error('AWS_DYNAMODB_RECOMMENDATIONS_TABLE environment variable not set');
    }

    let recommendations = [];
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
      recommendations = recommendations.concat(response.Items);
      lastEvaluatedKey = response.LastEvaluatedKey;

      logMessage(`Fetched ${response.Items.length} recommendation entries from DynamoDB. Total: ${recommendations.length}`);
      
      // For dry runs, limit the number of entries to speed up testing
      if (options.dryRun && recommendations.length >= 10) {
        logMessage('Dry run mode - limiting to 10 recommendation entries for testing');
        break;
      }
    } while (lastEvaluatedKey);

    return recommendations;
  } catch (error) {
    logMessage(`Error fetching recommendations: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Create or update Shopify metafields for a product
 */
async function createMetafields(productId, metafields, session, options) {
  if (options.dryRun) {
    logMessage(`[DRY RUN] Would create ${metafields.length} metafields for product ${productId}`);
    return { success: true };
  }

  try {
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    const results = [];

    for (const metafield of metafields) {
      try {
        const response = await client.post({
          path: `products/${productId}/metafields`,
          data: { metafield },
          type: 'json',
        });

        results.push({
          success: true,
          key: metafield.key,
          id: response.body.metafield.id
        });

        logMessage(`Successfully created metafield '${metafield.key}' for product ${productId}`);
      } catch (error) {
        results.push({
          success: false,
          key: metafield.key,
          error: error.message
        });

        logMessage(`Error creating metafield '${metafield.key}' for product ${productId}: ${error.message}`, 'error');
      }
    }

    return { 
      success: results.some(r => r.success), 
      results 
    };
  } catch (error) {
    logMessage(`Error creating metafields for product ${productId}: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

/**
 * Register metafield definitions if needed
 * This is required for some metafield types to be visible in the Shopify admin
 */
async function registerMetafieldDefinitions(session, options) {
  if (options.dryRun) {
    logMessage(`[DRY RUN] Would register metafield definitions`);
    return { success: true };
  }

  try {
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    
    // Define the metafield definitions we need
    const definitions = [
      {
        name: "Game Features",
        namespace: "gamedin",
        key: "features",
        description: "Special features of the game",
        owner_resource: "product",
        type: "json_string"
      },
      {
        name: "Game Platforms",
        namespace: "gamedin",
        key: "platforms",
        description: "Platforms the game is available on",
        owner_resource: "product",
        type: "list.single_line_text_field"
      },
      {
        name: "Age Rating",
        namespace: "gamedin",
        key: "age_rating",
        description: "Age rating for the game",
        owner_resource: "product",
        type: "single_line_text_field"
      },
      {
        name: "Release Date",
        namespace: "gamedin",
        key: "release_date",
        description: "Original release date of the game",
        owner_resource: "product",
        type: "date"
      },
      {
        name: "Recommended Games",
        namespace: "gamedin",
        key: "recommended_games",
        description: "List of recommended game IDs",
        owner_resource: "product",
        type: "json_string"
      }
    ];
    
    // Create each definition
    for (const definition of definitions) {
      try {
        await client.post({
          path: 'metafield_definitions',
          data: { metafield_definition: definition },
          type: 'json',
        });
        
        logMessage(`Successfully registered metafield definition '${definition.namespace}.${definition.key}'`);
      } catch (error) {
        // If the definition already exists, that's fine
        if (error.message && error.message.includes('already exists')) {
          logMessage(`Metafield definition '${definition.namespace}.${definition.key}' already exists`);
        } else {
          logMessage(`Error registering metafield definition '${definition.namespace}.${definition.key}': ${error.message}`, 'error');
        }
      }
    }
    
    return { success: true };
  } catch (error) {
    logMessage(`Error registering metafield definitions: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

/**
 * Map game metadata to Shopify metafields
 */
function mapMetadataToMetafields(metadata) {
  const metafields = [];

  // Map basic metadata
  if (metadata.trailerUrl) {
    metafields.push({
      namespace: 'gamedin',
      key: 'trailer_url',
      value: metadata.trailerUrl,
      type: 'url'
    });
  }

  if (metadata.developerInfo) {
    metafields.push({
      namespace: 'gamedin',
      key: 'developer_info',
      value: typeof metadata.developerInfo === 'object' 
        ? JSON.stringify(metadata.developerInfo) 
        : metadata.developerInfo,
      type: 'json_string'
    });
  }

  if (metadata.systemRequirements) {
    metafields.push({
      namespace: 'gamedin',
      key: 'system_requirements',
      value: typeof metadata.systemRequirements === 'object' 
        ? JSON.stringify(metadata.systemRequirements) 
        : metadata.systemRequirements,
      type: 'json_string'
    });
  }

  if (metadata.gameplayDuration) {
    metafields.push({
      namespace: 'gamedin',
      key: 'gameplay_duration',
      value: metadata.gameplayDuration.toString(),
      type: 'single_line_text_field'
    });
  }

  if (metadata.supportedLanguages && Array.isArray(metadata.supportedLanguages)) {
    metafields.push({
      namespace: 'gamedin',
      key: 'supported_languages',
      value: JSON.stringify(metadata.supportedLanguages),
      type: 'list.single_line_text_field'
    });
  }

  if (metadata.awards && Array.isArray(metadata.awards)) {
    metafields.push({
      namespace: 'gamedin',
      key: 'awards',
      value: JSON.stringify(metadata.awards),
      type: 'json_string'
    });
  }

  return metafields;
}

/**
 * Map recommendations to Shopify metafields
 */
function mapRecommendationsToMetafields(recommendations, productMappings) {
  if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
    return [];
  }

  // Convert original IDs to Shopify IDs using the mapping
  const shopifyRecommendations = recommendations
    .map(recId => {
      const mapping = productMappings.find(m => m.originalId === recId);
      return mapping ? mapping.shopifyProductId : null;
    })
    .filter(Boolean);

  if (shopifyRecommendations.length === 0) {
    return [];
  }

  return [{
    namespace: 'gamedin',
    key: 'recommended_games',
    value: JSON.stringify(shopifyRecommendations),
    type: 'json_string'
  }];
}

/**
 * Main migration function
 */
async function migrate(options) {
  logMessage('Starting metafield migration...');
  
  const result = {
    processed: 0,
    success: 0,
    errors: 0
  };

  try {
    // Initialize AWS and Shopify connections
    const { dynamoDB } = initialize(options);
    
    // Get an offline session (in a real scenario, use a real authenticated session)
    const session = {
      shop: options.shopifyStore || process.env.SHOPIFY_SHOP,
      accessToken: process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN
    };

    // Register metafield definitions for better visibility in Shopify admin
    await registerMetafieldDefinitions(session, options);

    // Load product mappings
    const productMappings = loadProductMappings();
    if (productMappings.length === 0) {
      logMessage('No product mappings found. Please run product migration first.', 'warning');
      return { processed: 0, success: 0, errors: 0 };
    }

    logMessage(`Loaded ${productMappings.length} product mappings`);

    // Fetch game metadata
    const gameMetadata = await fetchGameMetadata(dynamoDB, options);
    logMessage(`Found ${gameMetadata.length} metadata entries to migrate`);

    // Fetch recommendations data
    const recommendationsData = await fetchRecommendations(dynamoDB, options);
    logMessage(`Found ${recommendationsData.length} recommendation entries to migrate`);

    // Process each metadata entry
    for (const metadata of gameMetadata) {
      try {
        const originalProductId = metadata.gameId || metadata.productId;
        if (!originalProductId) {
          logMessage(`Skipping metadata entry without product ID: ${JSON.stringify(metadata)}`, 'warning');
          continue;
        }

        // Find product mapping
        const productMapping = productMappings.find(m => m.originalId === originalProductId);
        if (!productMapping) {
          logMessage(`No Shopify product found for original ID ${originalProductId}`, 'warning');
          continue;
        }

        const shopifyProductId = productMapping.shopifyProductId;
        logMessage(`Processing metadata for product ${productMapping.title} (${shopifyProductId})`);

        // Map metadata to metafields
        const metafields = mapMetadataToMetafields(metadata);

        // Find recommendations for this product
        const productRecommendations = recommendationsData.find(r => r.gameId === originalProductId || r.productId === originalProductId);
        if (productRecommendations && productRecommendations.recommendations) {
          const recommendationMetafields = mapRecommendationsToMetafields(
            productRecommendations.recommendations, 
            productMappings
          );
          
          metafields.push(...recommendationMetafields);
        }

        if (metafields.length === 0) {
          logMessage(`No metafields to create for product ${shopifyProductId}`, 'warning');
          continue;
        }

        result.processed++;

        // Create metafields in Shopify
        const createResult = await createMetafields(shopifyProductId, metafields, session, options);
        
        if (createResult.success) {
          result.success++;
          logMessage(`Successfully created metafields for product ${shopifyProductId}`);
        } else {
          result.errors++;
          logMessage(`Failed to create metafields for product ${shopifyProductId}: ${createResult.error}`, 'error');
        }
      } catch (error) {
        result.errors++;
        logMessage(`Error processing metadata: ${error.message}`, 'error');
      }
    }
    
    logMessage(`Metafield migration completed. Processed: ${result.processed}, Success: ${result.success}, Errors: ${result.errors}`);
    return result;
  } catch (error) {
    logMessage(`Migration failed: ${error.message}`, 'error');
    throw error;
  }
}

module.exports = {
  migrate
}; 