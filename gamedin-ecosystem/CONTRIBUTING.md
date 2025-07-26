# Contributing to GameDin

Thank you for your interest in contributing to GameDin! We appreciate your time and effort in making this project better. This guide will help you get started with contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Code Style](#-code-style)
- [Commit Message Guidelines](#-commit-message-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Reporting Bugs](#-reporting-bugs)
- [Feature Requests](#-feature-requests)
- [License](#-license)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior to [your-email@example.com].

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/gamedin-ecosystem.git
   cd gamedin-ecosystem
   ```
3. **Set up the development environment**:
   ```bash
   # Install pnpm if you haven't already
   npm install -g pnpm
   
   # Install dependencies
   pnpm install
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your configuration
   ```
4. **Start the development server**:
   ```bash
   pnpm dev
   ```

## 🔄 Development Workflow

1. **Create a new branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/annoying-bug
   ```

2. **Make your changes** following the code style guidelines below.

3. **Run tests** to ensure nothing is broken:
   ```bash
   pnpm test
   ```

4. **Lint your code** to catch any style issues:
   ```bash
   pnpm lint
   ```

5. **Commit your changes** following the commit message guidelines.

6. **Push your changes** to your fork:
   ```bash
   git push origin your-branch-name
   ```

7. **Open a Pull Request** from your fork to the main repository.

## 🎨 Code Style

- Use **TypeScript** for all new code
- Follow the [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- Use **Prettier** for code formatting (configured in `.prettierrc`)
- Use **ESLint** for code quality (configured in `.eslintrc.js`)
- Write meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused on a single responsibility

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Here are some examples:

```
feat(auth): add password reset functionality
fix(api): handle null reference in user service
docs: update README with new installation steps
chore(deps): update dependencies
test(auth): add tests for login flow
refactor(ui): extract button component
style: format code with prettier
ci: update GitHub actions workflow
perf: improve performance of search algorithm
```

## 🔄 Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations, and container parameters.
3. Increase the version numbers in any example files and the README.md to the new version that this Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/).
4. You may merge the Pull Request once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

## 🐛 Reporting Bugs

Before creating bug reports, please check if the issue has already been reported. If it has, add a comment to the existing issue instead of opening a new one.

### How to Report a Bug

1. **Use a clear and descriptive title** for the issue to identify the problem.
2. **Describe the exact steps** to reproduce the problem in as many details as possible.
3. **Provide specific examples** to demonstrate the steps. Include links to files or GitHub projects, or copy/pasteable snippets.
4. **Describe the behavior you observed** after following the steps and point out what exactly is the problem with that behavior.
5. **Explain which behavior you expected to see** instead and why.
6. **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem.

## 🎯 Feature Requests

We welcome feature requests. Before submitting one, please check if a similar feature has already been requested.

### How to Request a Feature

1. **Use a clear and descriptive title** for the feature request.
2. **Provide a step-by-step description** of the suggested enhancement in as many details as possible.
3. **Explain why this enhancement would be useful** to most GameDin users.
4. **List some other applications where this feature exists, if applicable**.

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Thanks to all our contributors who have helped make GameDin better!
- Special thanks to everyone who has reported bugs, suggested features, and helped improve the documentation.
