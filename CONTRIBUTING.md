# Contributing to GameDin 🎮

Thank you for your interest in contributing to GameDin! We're excited to have you on board. This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (see [.nvmrc](.nvmrc))
- PNPM 8.6.0+
- Git

### Setting Up the Project

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/GameDin.git
   cd GameDin
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Set up environment variables** (if needed):
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## 🛠 Development Workflow

### Branch Naming

Use the following prefix for your branches:
- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

Example: `feat/add-user-authentication`

### Code Style

We use the following tools to maintain code quality:

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

Run these commands before committing:

```bash
# Lint the code
pnpm lint

# Format the code
pnpm format

# Run tests
pnpm test
```

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

Example:
```
feat(auth): add user authentication

- Add JWT authentication
- Add login/logout endpoints
- Add user model

Closes #123
```

## 🧪 Testing

We use Jest for testing. To run tests:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## 📦 Pull Requests

1. **Keep PRs small and focused** - Each PR should address a single issue or feature
2. **Update documentation** - If your changes affect the API or behavior, update the relevant documentation
3. **Add tests** - New features and bug fixes should include tests
4. **Run all tests** - Make sure all tests pass before submitting a PR
5. **Squash commits** - Keep a clean commit history by squashing fixup commits
6. **Reference issues** - Link to any related issues in your PR description

### PR Template

When creating a PR, please use the following template:

```markdown
## Description

[Description of the changes]

## Related Issues

- Fixes #123
- Related to #456

## Checklist

- [ ] I have followed the project's code style
- [ ] I have added/updated tests
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested these changes
```

## 🏷 Versioning

We follow [Semantic Versioning](https://semver.org/) (SemVer) for versioning.

## 📜 Code of Conduct

Please note that this project is governed by the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🙏 Thank You!

Your contributions make GameDin better for everyone. Thank you for your time and effort!
