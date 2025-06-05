# GameDin Shopify App

A Shopify app for GameDin, a gaming platform that allows users to discover, purchase, and review games.

## Features

- **Game Management**: List and manage games as Shopify products with gaming-specific metadata
- **Customer Management**: Track customer preferences and game collections
- **Game Recommendations**: Provide personalized game recommendations based on purchase history and preferences
- **Reviews System**: Allow customers to review and rate games
- **Analytics Dashboard**: View key metrics about game sales and customer engagement

## Tech Stack

- **Frontend**: React, Shopify Polaris, React Router
- **Backend**: Express.js, Shopify API
- **Data Storage**: Shopify (Products, Customers, Orders), Metafields (Game-specific data)

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [Shopify Partner Account](https://partners.shopify.com/)
- [Shopify Development Store](https://help.shopify.com/en/partners/dashboard/development-stores)

## Setup

1. **Install dependencies**

```bash
cd gamedin-shopify/app
npm install
```

2. **Configure environment variables**

Create a `.env` file in the `app` directory with the following variables:

```
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=write_products,read_products,write_customers,read_customers,write_orders,read_orders,read_content,write_content,read_themes,write_themes,read_inventory,write_inventory,read_shipping,write_shipping,read_analytics
HOST=your_app_host
```

3. **Update the Shopify app configuration**

Edit the `shopify.app.toml` file with your app's details:

```toml
client_id = "your_api_key"
application_url = "https://your-app-url.com"
redirect_urls = ["https://your-app-url.com/auth/callback"]
dev_store_url = "your-dev-store.myshopify.com"
```

## Development

Start the development server:

```bash
cd app
npm run dev
```

This will start both the frontend and backend servers.

## Data Migration

To migrate data from AWS to Shopify, use the migration scripts:

```bash
cd scripts
node migration/index.js migrate --users --products --metafields --content
```

See the [Migration Guide](../docs/SHOPIFY_MIGRATION_GUIDE.md) for more details.

## Deployment

Build and deploy the app to Shopify:

```bash
cd app
npm run build
npm run deploy
```

## Project Structure

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

## License

MIT 