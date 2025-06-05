# GameDin Shopify Migration Guide

This comprehensive guide outlines the strategy and implementation steps for migrating the GameDin platform from AWS Amplify to Shopify.

## Table of Contents

1. [Migration Strategy Overview](#migration-strategy-overview)
2. [Architecture Comparison](#architecture-comparison)
3. [Development Approaches](#development-approaches)
4. [Data Migration Plan](#data-migration-plan)
5. [Implementation Steps](#implementation-steps)
6. [Testing and Verification](#testing-and-verification)
7. [Post-Migration Optimization](#post-migration-optimization)
8. [Resources and References](#resources-and-references)

## Migration Strategy Overview

### Key Considerations

- **Current Architecture**: React/Vite frontend with AWS Amplify backend services
- **Target Architecture**: Shopify platform with appropriate integration approach
- **Feature Preservation**: Maintain core features while adapting to Shopify's architecture
- **Performance**: Ensure optimal loading and interaction speed
- **SEO**: Maintain or improve search engine visibility
- **User Experience**: Preserve or enhance the user experience

### Migration Phases

1. **Assessment & Planning** (Current Phase)
2. **Proof of Concept Development**
3. **Core Implementation**
4. **Data Migration**
5. **Testing & Optimization**
6. **Launch & Monitoring**

## Architecture Comparison

### Current AWS Amplify Architecture

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Material UI, Custom Components
- **Authentication**: AWS Cognito
- **APIs**: GraphQL via AWS AppSync
- **Database**: DynamoDB
- **Storage**: S3
- **Functions**: AWS Lambda
- **Hosting**: AWS Amplify Hosting

### Shopify Architecture Options

#### Option 1: Shopify App

- **App Framework**: Shopify App Bridge
- **UI Framework**: Shopify Polaris (React-based)
- **Backend**: Node.js with Shopify API
- **Authentication**: Shopify OAuth
- **Deployment**: Shopify App Store
- **Data Storage**: App database (MongoDB, PostgreSQL, etc.)

#### Option 2: Shopify Theme Customization

- **Theme Development**: Liquid templates
- **Frontend Interactivity**: JavaScript/Alpine.js
- **Styling**: CSS/SCSS
- **Backend Logic**: Shopify Liquid
- **Data Storage**: Shopify metafields/settings

#### Option 3: Hybrid Approach

- **Theme**: Custom Shopify theme with Liquid
- **App Extensions**: Custom functionality via Shopify app extensions
- **Backend Services**: External API services integrated with Shopify

## Development Approaches

### Option 1: Standalone Shopify App

**Best For**: Complex applications with advanced functionality that extends Shopify

- Use Shopify CLI to create a new app
- Implement React components using Polaris UI
- Connect to Shopify APIs using GraphQL or REST
- Deploy as a standalone app in the Shopify App Store

#### Code Example - Shopify App Setup

```bash
# Install Shopify CLI
npm install -g @shopify/cli @shopify/app

# Create a new Shopify app
shopify app create

# Start development server
shopify app dev
```

#### App Configuration (shopify.app.toml)

```toml
name = "GameDin"
client_id = "YOUR_CLIENT_ID"
application_url = "https://gamedin.example.com"
embedded = true

[access_scopes]
# Define required scopes
scopes = "read_products,write_products,read_customers"

[auth]
redirect_urls = [
  "https://gamedin.example.com/auth/callback",
  "https://gamedin.example.com/auth/shopify/callback"
]

[webhooks]
api_version = "2023-10"

[pos]
embedded = false
```

### Option 2: Shopify Theme Customization

**Best For**: Presentation-focused sites with standard e-commerce functionality

- Create a custom Shopify theme or modify an existing one
- Implement custom sections and blocks using Liquid
- Add JavaScript for enhanced interactivity
- Use theme settings for configuration

#### Code Example - Theme Structure

```
theme/
├── assets/
│   ├── gamedin.js
│   └── gamedin.css
├── config/
│   └── settings_schema.json
├── layout/
│   └── theme.liquid
├── sections/
│   ├── header.liquid
│   └── game-recommendations.liquid
├── snippets/
│   └── product-card.liquid
└── templates/
    ├── index.liquid
    └── product.liquid
```

#### Liquid Template Example

```liquid
{% comment %}
  Game recommendations section
{% endcomment %}
<section class="game-recommendations" data-section-id="{{ section.id }}">
  <h2>{{ section.settings.title }}</h2>
  <div class="recommendations-grid">
    {% for product in collections[section.settings.collection].products limit: section.settings.products_to_show %}
      {% render 'product-card', product: product %}
    {% endfor %}
  </div>
</section>

{% schema %}
{
  "name": "Game Recommendations",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Section Title",
      "default": "Recommended Games"
    },
    {
      "type": "collection",
      "id": "collection",
      "label": "Collection"
    },
    {
      "type": "range",
      "id": "products_to_show",
      "min": 2,
      "max": 12,
      "step": 1,
      "default": 4,
      "label": "Games to show"
    }
  ],
  "presets": [
    {
      "name": "Game Recommendations",
      "category": "Custom Content"
    }
  ]
}
{% endschema %}
```

### Option 3: Hybrid Approach (Recommended)

**Best For**: Complex applications that need deep Shopify integration

- Create a custom theme for the presentation layer
- Develop app extensions for advanced functionality
- Use theme app extensions to embed app components in the theme
- Leverage external services for specialized functionality

#### Code Example - Theme App Extension

```bash
# Create a theme app extension
shopify extension create
```

#### Extension Configuration

```json
{
  "name": "GameDin Recommendations",
  "type": "theme-app-extension",
  "api_version": "2023-10",
  "features": {
    "browser_api": true,
    "guest_access": true
  }
}
```

## Data Migration Plan

### User Data

1. **Export user profiles** from AWS Cognito
2. **Transform data** to match Shopify customer structure
3. **Import customers** using Shopify API
4. **Map user IDs** to maintain relationships

### Product/Game Data

1. **Export game data** from DynamoDB
2. **Transform to Shopify product structure**
3. **Import products** using Shopify Admin API
4. **Store additional metadata** in product metafields

### User-Generated Content

1. **Export content** from current storage
2. **Transform to appropriate Shopify format**
3. **Import using Shopify APIs or app storage**

### Migration Scripts

We've created a comprehensive set of migration scripts to automate the data migration process. These scripts handle the extraction of data from AWS services, transformation to Shopify-compatible formats, and loading into the Shopify platform.

#### Script Structure

```
gamedin-shopify/scripts/
├── migration/
│   ├── index.js                # Main CLI entry point
│   ├── user-migration.js       # Handles user migration from Cognito to Shopify Customers
│   ├── product-migration.js    # Handles product migration from DynamoDB to Shopify Products
│   ├── metafield-migration.js  # Handles game metadata migration to Shopify metafields
│   └── content-migration.js    # Handles user-generated content migration
├── logs/                       # Migration logs directory
├── data/                       # Mapping files and temporary data
└── temp/                       # Temporary files (e.g., downloaded images)
```

#### Running the Migration

1. **Setup Environment Variables**

Create a `.env` file in the `gamedin-shopify/app` directory with the following variables:

```
# Shopify API credentials
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_API_SCOPES=read_products,write_products,read_customers,write_customers,read_content,write_content
SHOPIFY_SHOP=your-dev-store.myshopify.com
SHOPIFY_ADMIN_API_ACCESS_TOKEN=your_admin_api_token

# AWS credentials and configuration
AWS_REGION=us-east-1
AWS_COGNITO_USER_POOL_ID=your_user_pool_id
AWS_DYNAMODB_GAMES_TABLE=your_games_table
AWS_DYNAMODB_GAME_METADATA_TABLE=your_game_metadata_table
AWS_DYNAMODB_RECOMMENDATIONS_TABLE=your_recommendations_table
AWS_DYNAMODB_REVIEWS_TABLE=your_reviews_table
AWS_DYNAMODB_LISTS_TABLE=your_lists_table
```

2. **Install Dependencies**

```bash
cd gamedin-shopify/scripts
npm install
```

3. **Run Validation**

Before performing the actual migration, validate your data to identify potential issues:

```bash
node migration/index.js validate --users --products
```

4. **Run Migration**

Perform the migration in the following order:

```bash
# Migrate users first
node migration/index.js migrate --users

# Then migrate products
node migration/index.js migrate --products

# Then migrate metafields
node migration/index.js migrate --metafields

# Finally migrate user-generated content
node migration/index.js migrate --content
```

You can also run a dry run to test the migration without making actual changes:

```bash
node migration/index.js migrate --users --products --metafields --content --dry-run
```

5. **Verify Migration**

After migration, verify the data in your Shopify admin panel:
- Check that customers were created correctly
- Verify products and their metafields
- Ensure user-generated content is accessible

#### Migration Mappings

The migration scripts create mapping files that track the relationship between AWS resources and Shopify resources:

- `user-mapping.json`: Maps AWS Cognito user IDs to Shopify customer IDs
- `product-mapping.json`: Maps AWS DynamoDB product IDs to Shopify product IDs
- `content-mapping.json`: Maps user-generated content to Shopify metafields

These mapping files are essential for maintaining relationships between different data types during migration.

## Implementation Steps

### 1. Development Environment Setup

```bash
# Install Shopify CLI
npm install -g @shopify/cli @shopify/app

# Create a Partner account at partners.shopify.com

# Create a development store
# - Log in to Partner Dashboard
# - Navigate to Stores > Add store > Development store

# Connect to development store
shopify login
```

### 2. Project Structure Setup

We've implemented a hybrid approach with the following structure:

```
gamedin-shopify/
├── app/                      # Shopify App (React)
│   ├── frontend/             # React components 
│   │   ├── index.html        # HTML entry point
│   │   └── src/              # React source code
│   │       ├── App.jsx       # Main App component
│   │       ├── index.jsx     # React entry point
│   │       ├── index.css     # Global styles
│   │       ├── hooks/        # Custom React hooks
│   │       │   ├── useNavigationStructure.jsx  # Navigation hook
│   │       │   └── useToast.jsx                # Toast notifications hook
│   │       └── pages/        # React pages
│   │           ├── Dashboard.jsx       # Dashboard page
│   │           ├── Products.jsx        # Products listing page
│   │           ├── ProductDetails.jsx  # Product details page
│   │           ├── Customers.jsx       # Customers listing page
│   │           └── NotFound.jsx        # 404 page
│   └── web/                  # Express.js backend
│       ├── index.js          # Express server entry point
│       ├── shopify.js        # Shopify API configuration
│       ├── webhook-handlers.js # Webhook handlers for Shopify events
│       └── api-routes.js     # API routes for the frontend
├── scripts/                  # Migration scripts
│   └── migration/            # Data migration modules
│       ├── index.js          # Migration CLI entry point
│       ├── user-migration.js # User migration from Cognito to Shopify
│       ├── product-migration.js # Product migration from DynamoDB to Shopify
│       ├── metafield-migration.js # Metafield migration
│       └── content-migration.js # User-generated content migration
└── shopify.app.toml          # Shopify app configuration
```

### 3. Backend Implementation

The backend is implemented using Express.js and the Shopify API. Key components include:

#### Express Server (app/web/index.js)

The Express server handles:
- Authentication with Shopify OAuth
- Webhook processing
- API routes for the frontend
- Serving the React app

```javascript
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

// API routes
app.use("/api", shopify.validateAuthenticatedSession(), apiRoutes);
```

#### Shopify API Configuration (app/web/shopify.js)

This file configures the Shopify API client:

```javascript
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
  sessionStorage,
});
```

#### Webhook Handlers (app/web/webhook-handlers.js)

Webhook handlers process events from Shopify:

```javascript
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
  // ... other webhook handlers
};
```

#### API Routes (app/web/api-routes.js)

API routes provide data to the frontend:

```javascript
router.get("/products", async (req, res) => {
  const session = res.locals.shopify.session;
  // ... fetch products from Shopify
  res.status(200).send({ products: productsWithMetafields });
});

router.get("/products/:id/recommendations", async (req, res) => {
  // ... fetch recommendations from metafields
  res.status(200).send({ recommendations: validRecommendations });
});
```

### 4. Frontend Implementation

The frontend is implemented using React and Shopify Polaris. Key components include:

#### App Component (app/frontend/src/App.jsx)

The main App component sets up routing and navigation:

```jsx
return (
  <BrowserRouter>
    <AppProvider i18n={translations}>
      <Frame
        navigation={navigationMarkup}
        showMobileNavigation={mobileNavigationActive}
        onNavigationDismiss={toggleMobileNavigationActive}
      >
        <Routes>
          <Route path="/" element={<Dashboard showToast={showToast} />} />
          <Route path="/products" element={<Products showToast={showToast} />} />
          {/* ... other routes */}
        </Routes>
      </Frame>
    </AppProvider>
  </BrowserRouter>
);
```

#### Custom Hooks

Custom hooks provide reusable functionality:

- **useNavigationStructure.jsx**: Manages navigation structure and mobile navigation state
- **useToast.jsx**: Manages toast notifications

#### Pages

React pages provide the user interface:

- **Dashboard.jsx**: Shows key metrics and recent activity
- **Products.jsx**: Lists all games with filtering and search
- **ProductDetails.jsx**: Shows detailed information about a game
- **Customers.jsx**: Lists all customers with filtering and search

### 5. Data Migration

Data migration is handled by the scripts in the `scripts/migration` directory:

- **user-migration.js**: Migrates users from AWS Cognito to Shopify Customers
- **product-migration.js**: Migrates products from AWS DynamoDB to Shopify Products
- **metafield-migration.js**: Migrates game metadata to Shopify metafields
- **content-migration.js**: Migrates user-generated content like reviews and game lists

### 6. Development Workflow

```bash
# Start development server for the app
cd gamedin-shopify/app
npm run dev

# Run data migration
cd gamedin-shopify/scripts
node migration/index.js migrate --users --products --metafields --content
```

### 7. Deployment

```bash
# Build for production
cd gamedin-shopify/app
npm run build

# Deploy to Shopify
npm run deploy
```

## Testing and Verification

### Functional Testing

- Create test scenarios for each core feature
- Verify all user flows work as expected
- Test on multiple devices and browsers

### Performance Testing

- Use Lighthouse for performance metrics
- Test loading times for key pages
- Optimize based on test results

### Cross-browser Testing

- Test on Chrome, Firefox, Safari, Edge
- Verify mobile responsiveness

### Data Integrity Testing

- Verify migrated data accuracy
- Test CRUD operations on migrated data

## Post-Migration Optimization

### Performance Optimization

- Implement lazy loading
- Optimize asset delivery (images, JS, CSS)
- Use Shopify CDN effectively

### SEO Optimization

- Set up proper redirects from old URLs
- Update metadata and structured data
- Verify indexability

### Analytics Integration

- Set up Shopify Analytics
- Integrate Google Analytics
- Configure custom event tracking

## Resources and References

### Official Shopify Documentation

- [Shopify App Development](https://shopify.dev/apps)
- [Shopify Theme Development](https://shopify.dev/themes)
- [Shopify APIs](https://shopify.dev/api)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [Shopify Polaris](https://polaris.shopify.com/)

### Helpful Tools

- [Shopify App CLI](https://github.com/Shopify/shopify-app-cli)
- [Theme Check](https://github.com/shopify/theme-check)
- [Shopify Theme Inspector](https://chrome.google.com/webstore/detail/shopify-theme-inspector-f/fndnankcflemoafdeboboehphmiijcbe)

### Community Resources

- [Shopify Partners Forum](https://community.shopify.com/c/partners-and-developers/ct-p/appdev)
- [Shopify Developer Discord](https://discord.gg/shopify-developers)
- [Shopify Stack Exchange](https://shopify.stackexchange.com/) 