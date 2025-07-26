# GameDin Ecosystem

A modular, scalable, and maintainable gaming platform built with a microservices architecture.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker (for local development)
- AWS Account (for deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/gamedin-ecosystem.git
   cd gamedin-ecosystem
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Update the .env file with your configuration
   ```

4. Start the development environment:
   ```bash
   pnpm dev
   ```

## 🏗 Project Structure

```
gamedin-ecosystem/
├── apps/                    # Frontend applications
│   └── web/                 # Main web application
├── packages/                # Shared packages
│   ├── api/                 # API service
│   ├── auth/                # Authentication service
│   ├── chat/                # Chat service
│   ├── llm/                 # LLM integration
│   ├── matchmaker/          # Matchmaking service
│   ├── onboarding/          # User onboarding flow
│   └── shared/              # Shared utilities and types
├── infrastructure/          # Infrastructure as Code (Terraform)
├── scripts/                 # Utility scripts
├── .github/                 # GitHub workflows
├── .husky/                  # Git hooks
├── .vscode/                 # VSCode settings
├── .eslintrc.js             # ESLint configuration
├── .prettierrc              # Prettier configuration
├── jest.config.js           # Jest configuration
├── package.json             # Root package.json
├── pnpm-workspace.yaml      # pnpm workspace configuration
└── turbo.json               # Turborepo configuration
```

## 🛠 Development

### Available Scripts

- `pnpm dev` - Start development servers for all packages
- `pnpm build` - Build all packages
- `pnpm test` - Run tests for all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format all files with Prettier
- `pnpm changeset` - Create a changeset for versioning

### Adding a New Package

1. Create a new directory in `packages/`
2. Run `pnpm init` in the new directory
3. Update the `package.json` with the appropriate configuration
4. Create the necessary source files in `src/`
5. Update the root `tsconfig.json` with the new package reference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Turborepo](https://turbo.build/) for the monorepo tooling
- [pnpm](https://pnpm.io/) for fast, disk space efficient package management
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [Jest](https://jestjs.io/) for testing
- [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for code quality
