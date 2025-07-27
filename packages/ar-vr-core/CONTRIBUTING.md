# Contributing to GameDin AR/VR Core

Thank you for your interest in contributing to the GameDin AR/VR Core package! We welcome contributions from the community to help improve this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development Workflow](#development-workflow)
- [Making Changes](#making-changes)
  - [Coding Standards](#coding-standards)
  - [Testing](#testing)
  - [Documentation](#documentation)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Issues](#reporting-issues)
- [License](#license)

## Code of Conduct

This project adheres to the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code. Please report unacceptable behavior to [contact@gamedin.io](mailto:contact@gamedin.io).

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm, yarn, or pnpm (we recommend pnpm for this project)
- Git

### Installation

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/ar-vr-core.git
   cd ar-vr-core
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Build the project:
   ```bash
   pnpm build
   ```

### Development Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number-description
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Make your changes following the [coding standards](#coding-standards)

4. Run tests to ensure everything works:
   ```bash
   pnpm test
   ```

5. Build the project to check for any build errors:
   ```bash
   pnpm build
   ```

6. Commit your changes with a descriptive commit message:
   ```bash
   git commit -m "feat: add new AR marker detection feature"
   ```

7. Push your changes to your fork:
   ```bash
   git push origin your-branch-name
   ```

8. Open a pull request against the `main` branch of the upstream repository

## Making Changes

### Coding Standards

- Follow the [TypeScript](https://www.typescriptlang.org/docs/) and [React](https://reactjs.org/docs/getting-started.html) best practices
- Use [Prettier](https://prettier.io/) for code formatting
- Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages
- Write clear and concise code comments where necessary
- Keep functions and components small and focused on a single responsibility

### Testing

We use [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/) for testing. Follow these guidelines:

- Write unit tests for all new features and bug fixes
- Ensure tests cover edge cases and error conditions
- Run tests before committing:
  ```bash
  pnpm test
  ```
- For test coverage:
  ```bash
  pnpm test:coverage
  ```
- For watching tests during development:
  ```bash
  pnpm test:watch
  ```

### Documentation

- Update the README.md with any new features or changes
- Add JSDoc comments to all exported functions and components
- Document any breaking changes in the CHANGELOG.md
- Keep the API documentation up to date

## Submitting a Pull Request

1. Ensure your fork is up to date with the latest changes from the upstream repository:
   ```bash
   git remote add upstream https://github.com/gamedin/ar-vr-core.git
   git fetch upstream
   git merge upstream/main
   ```

2. Rebase your changes on top of the latest main branch:
   ```bash
   git rebase main
   ```

3. Push your changes to your fork:
   ```bash
   git push -f origin your-branch-name
   ```

4. Open a pull request from your fork to the upstream repository

5. Fill out the pull request template with the following information:
   - A clear title and description
   - The motivation for the change
   - Any related issues or pull requests
   - Screenshots or screen recordings for UI changes
   - Steps to test the changes

6. Request a review from one of the maintainers

## Reporting Issues

If you find a bug or have a feature request, please open an issue on GitHub with the following information:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots or screen recordings if applicable
- Browser/device information
- Any error messages or console logs

## License

By contributing to this project, you agree that your contributions will be licensed under the [MIT License](LICENSE).
