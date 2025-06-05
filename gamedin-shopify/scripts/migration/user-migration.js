/**
 * User Migration Module
 * 
 * Handles migration of user accounts from AWS Cognito to Shopify Customers
 */

const AWS = require('aws-sdk');
const Shopify = require('@shopify/shopify-api');
const fs = require('fs');
const path = require('path');
const { parsePhoneNumber } = require('libphonenumber-js');

// Constants
const LOG_FILE = path.resolve(__dirname, '../logs/user-migration.log');
const USER_MAPPING_FILE = path.resolve(__dirname, '../data/user-mapping.json');

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
  const cognito = new AWS.CognitoIdentityServiceProvider();
  
  return { cognito };
}

/**
 * Fetch users from AWS Cognito
 */
async function fetchAwsUsers(cognito, options) {
  try {
    const userPoolId = process.env.AWS_COGNITO_USER_POOL_ID;
    if (!userPoolId) {
      throw new Error('AWS_COGNITO_USER_POOL_ID environment variable not set');
    }

    let users = [];
    let paginationToken = null;

    do {
      const params = {
        UserPoolId: userPoolId,
        Limit: 60,
      };

      if (paginationToken) {
        params.PaginationToken = paginationToken;
      }

      const response = await cognito.listUsers(params).promise();
      users = users.concat(response.Users);
      paginationToken = response.PaginationToken;

      logMessage(`Fetched ${response.Users.length} users from Cognito. Total: ${users.length}`);
      
      // For dry runs, limit the number of users to speed up testing
      if (options.dryRun && users.length >= 10) {
        logMessage('Dry run mode - limiting to 10 users for testing');
        break;
      }
    } while (paginationToken);

    return users;
  } catch (error) {
    logMessage(`Error fetching AWS users: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Map Cognito user to Shopify customer format
 */
function mapUserToCustomer(cognitoUser) {
  try {
    // Extract attributes from Cognito user
    const attributes = {};
    cognitoUser.Attributes.forEach(attr => {
      attributes[attr.Name] = attr.Value;
    });

    // Build basic customer object
    const customer = {
      first_name: attributes['given_name'] || '',
      last_name: attributes['family_name'] || '',
      email: attributes['email'] || '',
      phone: attributes['phone_number'] || '',
      verified_email: attributes['email_verified'] === 'true',
      accepts_marketing: false, // Default to false, may need adjustment based on user preferences
      tags: ['gamedin-migrated'], // Tag these customers for future reference
      note: 'Migrated from GameDin AWS', // Add a note to identify migrated accounts
      metafields: [],
    };

    // Add game preferences as metafields if available
    if (attributes['custom:game_preferences']) {
      try {
        const preferences = JSON.parse(attributes['custom:game_preferences']);
        customer.metafields.push({
          key: 'game_preferences',
          value: JSON.stringify(preferences),
          type: 'json_string',
          namespace: 'gamedin'
        });
      } catch (e) {
        logMessage(`Error parsing game preferences for user ${attributes['email']}: ${e.message}`, 'warning');
      }
    }

    // Add user type as metafield
    if (attributes['custom:user_type']) {
      customer.metafields.push({
        key: 'user_type',
        value: attributes['custom:user_type'],
        type: 'string',
        namespace: 'gamedin'
      });
    }

    // Format phone number if present
    if (customer.phone) {
      try {
        const phoneNumber = parsePhoneNumber(customer.phone);
        if (phoneNumber) {
          customer.phone = phoneNumber.formatInternational();
        }
      } catch (e) {
        logMessage(`Error formatting phone number for user ${customer.email}: ${e.message}`, 'warning');
      }
    }

    return {
      customer
    };
  } catch (error) {
    logMessage(`Error mapping user to customer: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Create customer in Shopify
 */
async function createShopifyCustomer(customer, session, options) {
  if (options.dryRun) {
    logMessage(`[DRY RUN] Would create customer: ${customer.first_name} ${customer.last_name} (${customer.email})`);
    return { success: true, id: 'dry-run-id' };
  }

  try {
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    const response = await client.post({
      path: 'customers',
      data: { customer },
      type: 'json',
    });

    return { 
      success: true, 
      id: response.body.customer.id,
      customer: response.body.customer 
    };
  } catch (error) {
    // Handle specific Shopify errors
    if (error.response) {
      logMessage(`Shopify API error creating customer ${customer.email}: ${JSON.stringify(error.response.body)}`, 'error');
    } else {
      logMessage(`Error creating Shopify customer ${customer.email}: ${error.message}`, 'error');
    }
    return { success: false, error: error.message };
  }
}

/**
 * Main migration function
 */
async function migrate(options) {
  logMessage('Starting user migration...');
  
  const result = {
    processed: 0,
    success: 0,
    errors: 0,
    mappings: []
  };

  try {
    // Initialize AWS and Shopify connections
    const { cognito } = initialize(options);
    
    // Get an offline session (in a real scenario, use a real authenticated session)
    const session = {
      shop: options.shopifyStore || process.env.SHOPIFY_SHOP,
      accessToken: process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN
    };

    // Fetch users from AWS Cognito
    const users = await fetchAwsUsers(cognito, options);
    logMessage(`Found ${users.length} users to migrate`);
    
    result.processed = users.length;
    
    // Process each user
    for (const cognitoUser of users) {
      try {
        const cognitoUsername = cognitoUser.Username;
        const userEmail = cognitoUser.Attributes.find(attr => attr.Name === 'email')?.Value;
        
        logMessage(`Processing user: ${userEmail || cognitoUsername}`);
        
        // Map Cognito user to Shopify customer
        const { customer } = mapUserToCustomer(cognitoUser);
        
        // Create customer in Shopify
        const createResult = await createShopifyCustomer(customer, session, options);
        
        if (createResult.success) {
          result.success++;
          
          // Store mapping for reference
          result.mappings.push({
            cognitoUsername,
            shopifyCustomerId: createResult.id,
            email: customer.email
          });
          
          logMessage(`Successfully migrated user ${customer.email}`);
        } else {
          result.errors++;
          logMessage(`Failed to migrate user ${customer.email}: ${createResult.error}`, 'error');
        }
      } catch (error) {
        result.errors++;
        logMessage(`Error processing user ${cognitoUser.Username}: ${error.message}`, 'error');
      }
    }
    
    // Save user mapping file
    if (!options.dryRun && result.mappings.length > 0) {
      fs.writeFileSync(USER_MAPPING_FILE, JSON.stringify(result.mappings, null, 2));
      logMessage(`User mapping saved to ${USER_MAPPING_FILE}`);
    }
    
    logMessage(`User migration completed. Processed: ${result.processed}, Success: ${result.success}, Errors: ${result.errors}`);
    return result;
  } catch (error) {
    logMessage(`Migration failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Validate AWS user data without migration
 */
async function validate(options) {
  logMessage('Starting user data validation...');
  
  const result = {
    processed: 0,
    valid: 0,
    invalid: 0,
    issues: []
  };

  try {
    // Initialize AWS and Shopify connections
    const { cognito } = initialize(options);
    
    // Fetch users from AWS Cognito
    const users = await fetchAwsUsers(cognito, options);
    logMessage(`Found ${users.length} users to validate`);
    
    result.processed = users.length;
    
    // Validate each user
    for (const cognitoUser of users) {
      try {
        const userEmail = cognitoUser.Attributes.find(attr => attr.Name === 'email')?.Value;
        
        logMessage(`Validating user: ${userEmail || cognitoUser.Username}`);
        
        // Check required attributes
        const hasEmail = Boolean(userEmail);
        const hasFirstName = Boolean(cognitoUser.Attributes.find(attr => attr.Name === 'given_name')?.Value);
        const hasLastName = Boolean(cognitoUser.Attributes.find(attr => attr.Name === 'family_name')?.Value);
        
        // Validate email format
        const validEmailFormat = hasEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail);
        
        if (hasEmail && hasFirstName && hasLastName && validEmailFormat) {
          result.valid++;
          logMessage(`User ${userEmail} is valid`);
        } else {
          result.invalid++;
          
          const issues = [];
          if (!hasEmail) issues.push('Missing email');
          if (!validEmailFormat && hasEmail) issues.push('Invalid email format');
          if (!hasFirstName) issues.push('Missing first name');
          if (!hasLastName) issues.push('Missing last name');
          
          result.issues.push({
            username: cognitoUser.Username,
            email: userEmail,
            issues
          });
          
          logMessage(`User ${userEmail || cognitoUser.Username} has validation issues: ${issues.join(', ')}`, 'warning');
        }
      } catch (error) {
        result.invalid++;
        logMessage(`Error validating user ${cognitoUser.Username}: ${error.message}`, 'error');
        result.issues.push({
          username: cognitoUser.Username,
          issues: ['Error during validation: ' + error.message]
        });
      }
    }
    
    // Save validation issues to file
    if (result.issues.length > 0) {
      const issuesFile = path.resolve(__dirname, '../data/user-validation-issues.json');
      fs.writeFileSync(issuesFile, JSON.stringify(result.issues, null, 2));
      logMessage(`Validation issues saved to ${issuesFile}`);
    }
    
    logMessage(`User validation completed. Processed: ${result.processed}, Valid: ${result.valid}, Invalid: ${result.invalid}`);
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