# GameDin

GameDin is a modern gaming platform built with React, Vite, and AWS Amplify, offering real-time game recommendations, social features, and personalized gaming experiences.

## 🚀 Features

- Real-time game recommendations using AI
- Social gaming features and achievements
- Dark mode support
- Responsive design for all devices
- AWS Amplify powered backend
- Real-time chat and notifications
- Secure authentication with AWS Cognito

## 🚀 AWS Amplify Gen2 Deployment

GameDin is optimized for deployment on AWS Amplify Gen2, offering advanced features and performance optimizations:

### 🔑 Key Optimizations

- **Enhanced Build Process**:
  - Optimized code splitting with smart chunk naming
  - Brotli and Gzip compression for faster load times
  - Environment-specific builds with proper cache headers

- **Progressive Web App (PWA)**:
  - Full offline support with strategic cache management
  - Installable on mobile and desktop devices
  - Push notification capability

- **Security Enhancements**:
  - Comprehensive Content Security Policy (CSP)
  - Advanced header protection against common vulnerabilities
  - AWS WAF integration for traffic filtering

- **Performance Improvements**:
  - Smart asset organization and loading
  - Efficient caching strategies for different resource types
  - Optimized JS bundles with proper code splitting

For detailed deployment instructions, see our [Amplify Gen2 Deployment Guide](docs/AMPLIFY_GEN2_DEPLOYMENT.md).

## 🛠 Tech Stack

- **Frontend:**
  - React 18
  - Vite
  - TypeScript
  - Tailwind CSS
  - Shadcn UI
  - React Query
  - Zustand

- **Backend:**
  - AWS Amplify
  - AppSync (GraphQL)
  - Lambda Functions
  - DynamoDB
  - S3 Storage

- **DevOps:**
  - GitHub Actions
  - AWS CloudWatch
  - AWS WAF
  - Feature Flags
  - Automated Testing

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/M-K-World-Wide/GameDin.git
   cd GameDin
   ```

2. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.development
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## 🧪 Testing

Run the test suite:
```bash
npm run test        # Unit tests
npm run test:e2e    # E2E tests
npm run test:ci     # CI pipeline tests
```

## 📚 Documentation

- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing Guide](docs/CONTRIBUTING.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)

## 🔒 Security

- WAF protection against common attacks
- Rate limiting
- Input validation
- Secure authentication
- Regular security audits

## 🎯 Roadmap

- [ ] Enhanced AI recommendations
- [ ] Mobile app integration
- [ ] Advanced social features
- [ ] Game streaming integration
- [ ] Esports tournament platform

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

Please read our [Contributing Guide](docs/CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- [Sunny](https://github.com/M-K-World-Wide) - Lead Developer
- [Contributors](https://github.com/M-K-World-Wide/GameDin/graphs/contributors)

## 🙏 Acknowledgments

- [AWS Amplify Team](https://aws.amazon.com/amplify/)
- [React Community](https://reactjs.org/)
- [Vite Team](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/) 