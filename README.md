# GameDin - Social Gaming Platform v5.0.0

A modern, high-performance social gaming platform built with React 19, TypeScript 5.5+, Vite 6+, and AWS Amplify. Features AI-powered recommendations, blockchain integration, and comprehensive offline capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- AWS Account with Amplify access

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build:optimized
```

## 🏗️ Architecture

### Frontend Stack
- **React 19** - Latest React with concurrent features
- **TypeScript 5.5+** - Strict type checking
- **Vite 6+** - Lightning-fast build tool
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **SWR** - Data fetching and caching

### AWS Integration
- **AWS Amplify** - Full-stack development platform
- **AWS Cognito** - Authentication and user management
- **AWS AppSync** - GraphQL API with real-time subscriptions
- **AWS DynamoDB** - NoSQL database
- **AWS S3** - File storage
- **AWS CloudFront** - Global CDN
- **AWS Lambda** - Serverless functions

### AI & Blockchain
- **Novasanctum AI** - AI-powered recommendations and moderation
- **Divina-L3** - Layer 3 blockchain integration
- **Ethereum** - Smart contract support

## 📦 Optimization Features

### Performance Optimizations
- **Code Splitting** - Automatic route-based splitting
- **Lazy Loading** - Components loaded on demand
- **Tree Shaking** - Unused code elimination
- **Bundle Analysis** - Real-time bundle size monitoring
- **Image Optimization** - Automatic compression and formats
- **Font Optimization** - Subset and preloading

### AWS-Specific Optimizations
- **CloudFront Integration** - Global content delivery
- **Lambda@Edge** - Edge computing capabilities
- **Cost Optimization** - Resource usage monitoring
- **Performance Monitoring** - Real-time metrics
- **Security Headers** - Comprehensive protection

### Offline Capabilities
- **Service Worker** - PWA functionality
- **IndexedDB** - Local data persistence
- **Background Sync** - Offline operation queuing
- **Cache Strategies** - Intelligent caching

## 🚀 AWS Amplify Deployment

### Automatic Deployment
This project is optimized for AWS Amplify deployment with:

1. **Optimized Build Process**
   - Multi-stage builds (dev/staging/prod)
   - Asset optimization and compression
   - Security scanning and auditing
   - Performance testing with Lighthouse

2. **Environment Configuration**
   - Environment-specific settings
   - Feature flags for gradual rollouts
   - AWS service integration
   - Monitoring and alerting

3. **CI/CD Pipeline**
   - Automated testing
   - Security scanning
   - Performance monitoring
   - Deployment validation

### Manual Deployment
```bash
# Build optimized production bundle
npm run build:production

# Deploy to AWS Amplify
npm run amplify:push

# Publish to production
npm run amplify:publish
```

## 🧪 Testing

### Test Coverage
- **Unit Tests** - Vitest with React Testing Library
- **Integration Tests** - Cypress E2E testing
- **Performance Tests** - Lighthouse CI
- **Security Tests** - Automated vulnerability scanning

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance

# Security audit
npm run security:audit
```

## 📊 Performance Metrics

### Target Metrics
- **Page Load Time** - < 2 seconds
- **Lighthouse Score** - > 90
- **Core Web Vitals** - All green
- **Bundle Size** - < 500KB initial
- **Time to Interactive** - < 3 seconds

### Monitoring
- Real-time performance monitoring
- Error tracking and alerting
- User experience metrics
- Cost optimization analysis

## 🔧 Configuration

### Environment Variables
```bash
# AWS Configuration
VITE_AWS_REGION=us-east-1
VITE_CLOUDFRONT_DOMAIN=your-domain.cloudfront.net
VITE_S3_BUCKET=your-bucket-name

# AI Integration
VITE_NOVASANCTUM_ENABLED=true
VITE_NOVASANCTUM_API_URL=https://api.novasanctum.com
VITE_NOVASANCTUM_API_KEY=your-api-key

# Blockchain Integration
VITE_DIVINA_L3_ENABLED=true
VITE_DIVINA_L3_RPC_URL=https://rpc.divina-l3.com
VITE_DIVINA_L3_CHAIN_ID=1337421

# Feature Flags
VITE_ENABLE_MOCK_MODE=false
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_REAL_TIME=true
```

### Build Profiles
- **Ultra** - Maximum performance for high-end devices
- **High** - High performance for good devices
- **Balanced** - Balanced performance for average devices
- **Minimal** - Minimal performance for limited devices

## 🛡️ Security

### Security Features
- **Content Security Policy** - XSS protection
- **HTTPS Enforcement** - Secure connections
- **Rate Limiting** - API protection
- **Input Validation** - Zod schemas
- **Authentication** - JWT with refresh tokens
- **Authorization** - Role-based access control

### Security Scanning
- Automated vulnerability scanning
- Dependency audit
- Code security analysis
- Penetration testing

## 📱 PWA Features

### Progressive Web App
- **Installable** - Add to home screen
- **Offline Support** - Works without internet
- **Push Notifications** - Real-time updates
- **Background Sync** - Data synchronization
- **App-like Experience** - Native feel

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Accessibility compliance
- Performance optimization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Architecture Guide](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing Guide](docs/CONTRIBUTING.md)

### Issues
- [GitHub Issues](https://github.com/your-org/gamedin/issues)
- [Discord Community](https://discord.gg/gamedin)
- [Email Support](mailto:support@gamedin.app)

---

**Built with ❤️ by the GameDin Team**

*Optimized for AWS Amplify deployment with maximum performance and scalability.* 