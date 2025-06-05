/**
 * Product Migration Module
 * 
 * Handles migration of game product data from AWS DynamoDB to Shopify Products
 */

const AWS = require('aws-sdk');
const Shopify = require('@shopify/shopify-api');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Constants
const LOG_FILE = path.resolve(__dirname, '../logs/product-migration.log');
const PRODUCT_MAPPING_FILE = path.resolve(__dirname, '../data/product-mapping.json');
const IMAGE_DOWNLOAD_DIR = path.resolve(__dirname, '../temp/images');

// Ensure directories exist
fs.mkdirSync(path.resolve(__dirname, '../logs'), { recursive: true });
fs.mkdirSync(path.resolve(__dirname, '../data'), { recursive: true });
fs.mkdirSync(IMAGE_DOWNLOAD_DIR, { recursive: true });

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
  const s3 = new AWS.S3();
  
  return { dynamoDB, s3 };
}

/**
 * Fetch products from AWS DynamoDB
 */
async function fetchAwsProducts(dynamoDB, options) {
  try {
    const tableName = process.env.AWS_DYNAMODB_GAMES_TABLE;
    if (!tableName) {
      throw new Error('AWS_DYNAMODB_GAMES_TABLE environment variable not set');
    }

    let products = [];
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
      products = products.concat(response.Items);
      lastEvaluatedKey = response.LastEvaluatedKey;

      logMessage(`Fetched ${response.Items.length} products from DynamoDB. Total: ${products.length}`);
      
      // For dry runs, limit the number of products to speed up testing
      if (options.dryRun && products.length >= 10) {
        logMessage('Dry run mode - limiting to 10 products for testing');
        break;
      }
    } while (lastEvaluatedKey);

    return products;
  } catch (error) {
    logMessage(`Error fetching AWS products: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Download an image from URL or S3 bucket
 */
async function downloadImage(imageUrl, s3) {
  try {
    let imageData;
    let contentType;
    
    // Check if the image URL is an S3 URL
    if (imageUrl.includes('s3.amazonaws.com')) {
      // Parse S3 URL to get bucket and key
      const urlParts = new URL(imageUrl);
      const pathParts = urlParts.pathname.split('/');
      
      // Remove empty first element from path
      pathParts.shift();
      
      // First part is the bucket name
      const bucket = pathParts.shift();
      // Rest of the path is the key
      const key = pathParts.join('/');
      
      logMessage(`Downloading image from S3: ${bucket}/${key}`);
      
      const response = await s3.getObject({
        Bucket: bucket,
        Key: key
      }).promise();
      
      imageData = response.Body;
      contentType = response.ContentType;
    } else {
      // Regular HTTP/HTTPS URL
      logMessage(`Downloading image from URL: ${imageUrl}`);
      
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
      });
      
      imageData = response.data;
      contentType = response.headers['content-type'];
    }
    
    // Generate a unique filename based on the URL
    const filename = `${Date.now()}-${path.basename(imageUrl)}`;
    const filePath = path.join(IMAGE_DOWNLOAD_DIR, filename);
    
    // Save the image to a temporary file
    fs.writeFileSync(filePath, imageData);
    
    return { filePath, contentType };
  } catch (error) {
    logMessage(`Error downloading image ${imageUrl}: ${error.message}`, 'error');
    return null;
  }
}

/**
 * Map DynamoDB product to Shopify product format
 */
function mapProductToShopify(dynamoProduct) {
  try {
    // Extract common attributes
    const {
      id,
      title,
      description,
      price,
      images,
      publisher,
      releaseDate,
      platforms,
      genres,
      ageRating,
      features,
      tags,
      inventory = 10, // Default inventory if not specified
      status = 'active'
    } = dynamoProduct;

    // Map status
    const shopifyStatus = status === 'active' ? 'active' : 'draft';
    
    // Format price (Shopify expects a string)
    const formattedPrice = typeof price === 'number' ? price.toFixed(2) : price;

    // Format genres as tags
    const productTags = [
      ...(tags || []),
      ...(genres || []),
      'gamedin-migrated'
    ].filter(Boolean);

    // Prepare variants array (for different platforms if applicable)
    const variants = [];
    
    // If we have platforms, create a variant for each
    if (platforms && platforms.length > 0) {
      platforms.forEach(platform => {
        variants.push({
          title: platform,
          price: formattedPrice,
          inventory_quantity: inventory,
          requires_shipping: true,
          inventory_management: 'shopify',
        });
      });
    } else {
      // Default variant if no platforms
      variants.push({
        title: 'Default',
        price: formattedPrice,
        inventory_quantity: inventory,
        requires_shipping: true,
        inventory_management: 'shopify',
      });
    }

    // Format image data
    const productImages = [];
    if (images && images.length > 0) {
      // Map the image URLs to Shopify format
      // Note: We'll need to upload these later
      images.forEach(imageUrl => {
        productImages.push({ src: imageUrl });
      });
    }

    // Build the product object
    const product = {
      title: title,
      body_html: description,
      vendor: publisher || 'Unknown Publisher',
      product_type: 'Video Game',
      tags: productTags.join(', '),
      status: shopifyStatus,
      variants: variants,
      options: platforms && platforms.length > 0 ? [
        {
          name: 'Platform',
          values: platforms
        }
      ] : [],
      images: productImages,
      metafields: [
        {
          namespace: 'gamedin',
          key: 'original_id',
          value: id,
          type: 'single_line_text_field'
        },
        {
          namespace: 'gamedin',
          key: 'release_date',
          value: releaseDate,
          type: 'date'
        },
        {
          namespace: 'gamedin',
          key: 'age_rating',
          value: ageRating || 'Not Rated',
          type: 'single_line_text_field'
        }
      ]
    };

    // Add features as metafield if available
    if (features && features.length > 0) {
      product.metafields.push({
        namespace: 'gamedin',
        key: 'features',
        value: JSON.stringify(features),
        type: 'json_string'
      });
    }

    return {
      product,
      originalImages: images || []
    };
  } catch (error) {
    logMessage(`Error mapping product to Shopify format: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Create product in Shopify
 */
async function createShopifyProduct(product, session, options) {
  if (options.dryRun) {
    logMessage(`[DRY RUN] Would create product: ${product.title}`);
    return { success: true, id: 'dry-run-id' };
  }

  try {
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    const response = await client.post({
      path: 'products',
      data: { product },
      type: 'json',
    });

    return { 
      success: true, 
      id: response.body.product.id,
      product: response.body.product 
    };
  } catch (error) {
    // Handle specific Shopify errors
    if (error.response) {
      logMessage(`Shopify API error creating product ${product.title}: ${JSON.stringify(error.response.body)}`, 'error');
    } else {
      logMessage(`Error creating Shopify product ${product.title}: ${error.message}`, 'error');
    }
    return { success: false, error: error.message };
  }
}

/**
 * Upload product images to Shopify
 */
async function uploadProductImages(productId, imageUrls, session, s3, options) {
  if (options.dryRun || !imageUrls || imageUrls.length === 0) {
    return { success: true, uploadedImages: [] };
  }

  try {
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    const uploadedImages = [];

    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      
      try {
        // Download the image
        const imageResult = await downloadImage(imageUrl, s3);
        
        if (!imageResult) {
          logMessage(`Skipping image that failed to download: ${imageUrl}`, 'warning');
          continue;
        }
        
        const { filePath, contentType } = imageResult;
        
        // Read the file and encode to base64
        const fileData = fs.readFileSync(filePath);
        const base64Image = fileData.toString('base64');
        
        // Upload to Shopify
        const response = await client.post({
          path: `products/${productId}/images`,
          data: {
            image: {
              attachment: base64Image,
              filename: path.basename(filePath),
              alt: `Product image ${i + 1}`
            }
          },
          type: 'json',
        });

        uploadedImages.push(response.body.image);
        logMessage(`Successfully uploaded image ${i + 1} for product ${productId}`);
        
        // Clean up temporary file
        fs.unlinkSync(filePath);
      } catch (error) {
        logMessage(`Error uploading image ${imageUrl} for product ${productId}: ${error.message}`, 'error');
      }
    }

    return { success: true, uploadedImages };
  } catch (error) {
    logMessage(`Error handling image uploads for product ${productId}: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

/**
 * Main migration function
 */
async function migrate(options) {
  logMessage('Starting product migration...');
  
  const result = {
    processed: 0,
    success: 0,
    errors: 0,
    mappings: []
  };

  try {
    // Initialize AWS and Shopify connections
    const { dynamoDB, s3 } = initialize(options);
    
    // Get an offline session (in a real scenario, use a real authenticated session)
    const session = {
      shop: options.shopifyStore || process.env.SHOPIFY_SHOP,
      accessToken: process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN
    };

    // Fetch products from AWS DynamoDB
    const products = await fetchAwsProducts(dynamoDB, options);
    logMessage(`Found ${products.length} products to migrate`);
    
    result.processed = products.length;
    
    // Process each product
    for (const dynamoProduct of products) {
      try {
        logMessage(`Processing product: ${dynamoProduct.title || dynamoProduct.id}`);
        
        // Map DynamoDB product to Shopify product
        const { product, originalImages } = mapProductToShopify(dynamoProduct);
        
        // Create product in Shopify
        const createResult = await createShopifyProduct(product, session, options);
        
        if (createResult.success) {
          // Upload product images if available
          const shopifyProductId = createResult.id;
          
          if (originalImages && originalImages.length > 0) {
            logMessage(`Uploading ${originalImages.length} images for product ${shopifyProductId}`);
            await uploadProductImages(shopifyProductId, originalImages, session, s3, options);
          }
          
          result.success++;
          
          // Store mapping for reference
          result.mappings.push({
            originalId: dynamoProduct.id,
            shopifyProductId: shopifyProductId,
            title: product.title
          });
          
          logMessage(`Successfully migrated product ${product.title}`);
        } else {
          result.errors++;
          logMessage(`Failed to migrate product ${product.title}: ${createResult.error}`, 'error');
        }
      } catch (error) {
        result.errors++;
        logMessage(`Error processing product ${dynamoProduct.id}: ${error.message}`, 'error');
      }
    }
    
    // Save product mapping file
    if (!options.dryRun && result.mappings.length > 0) {
      fs.writeFileSync(PRODUCT_MAPPING_FILE, JSON.stringify(result.mappings, null, 2));
      logMessage(`Product mapping saved to ${PRODUCT_MAPPING_FILE}`);
    }
    
    logMessage(`Product migration completed. Processed: ${result.processed}, Success: ${result.success}, Errors: ${result.errors}`);
    return result;
  } catch (error) {
    logMessage(`Migration failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Validate AWS product data without migration
 */
async function validate(options) {
  logMessage('Starting product data validation...');
  
  const result = {
    processed: 0,
    valid: 0,
    invalid: 0,
    issues: []
  };

  try {
    // Initialize AWS connections
    const { dynamoDB } = initialize(options);
    
    // Fetch products from AWS DynamoDB
    const products = await fetchAwsProducts(dynamoDB, options);
    logMessage(`Found ${products.length} products to validate`);
    
    result.processed = products.length;
    
    // Validate each product
    for (const dynamoProduct of products) {
      try {
        logMessage(`Validating product: ${dynamoProduct.title || dynamoProduct.id}`);
        
        // Check required attributes
        const hasTitle = Boolean(dynamoProduct.title);
        const hasDescription = Boolean(dynamoProduct.description);
        const hasPrice = Boolean(dynamoProduct.price);
        
        // Additional validations
        const validPrice = typeof dynamoProduct.price === 'number' || 
          (typeof dynamoProduct.price === 'string' && !isNaN(parseFloat(dynamoProduct.price)));
          
        const issues = [];
        
        if (!hasTitle) issues.push('Missing title');
        if (!hasDescription) issues.push('Missing description');
        if (!hasPrice) issues.push('Missing price');
        if (hasPrice && !validPrice) issues.push('Invalid price format');
        if (!dynamoProduct.images || !Array.isArray(dynamoProduct.images) || dynamoProduct.images.length === 0) issues.push('Missing images');
        
        if (issues.length === 0) {
          result.valid++;
          logMessage(`Product ${dynamoProduct.title || dynamoProduct.id} is valid`);
        } else {
          result.invalid++;
          
          result.issues.push({
            id: dynamoProduct.id,
            title: dynamoProduct.title,
            issues
          });
          
          logMessage(`Product ${dynamoProduct.title || dynamoProduct.id} has validation issues: ${issues.join(', ')}`, 'warning');
        }
      } catch (error) {
        result.invalid++;
        logMessage(`Error validating product ${dynamoProduct.id}: ${error.message}`, 'error');
        result.issues.push({
          id: dynamoProduct.id,
          issues: ['Error during validation: ' + error.message]
        });
      }
    }
    
    // Save validation issues to file
    if (result.issues.length > 0) {
      const issuesFile = path.resolve(__dirname, '../data/product-validation-issues.json');
      fs.writeFileSync(issuesFile, JSON.stringify(result.issues, null, 2));
      logMessage(`Validation issues saved to ${issuesFile}`);
    }
    
    logMessage(`Product validation completed. Processed: ${result.processed}, Valid: ${result.valid}, Invalid: ${result.invalid}`);
    return result;
  } catch (error) {
    logMessage(`Validation failed: ${error.message}`, 'error');
    throw error;
  }
}

module.exports = {
  migrate,
  validate
}; 