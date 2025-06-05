# Contributing to GameDin

We love your input! We want to make contributing to GameDin as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Pull Request Process

1. Update the README.md with details of changes to the interface, if applicable.
2. Update the docs/ with any necessary documentation.
3. The PR will be merged once you have the sign-off of two other developers.

## Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable names
- Write descriptive commit messages
- Add comments for complex logic

## Commit Messages

Format: `<type>(<scope>): <subject>`

Example: `feat(auth): add Google OAuth integration`

Types:
- feat: new feature
- fix: bug fix
- docs: documentation
- style: formatting
- refactor: code restructuring
- test: adding tests
- chore: maintenance

## Testing

- Write unit tests for all new features
- Ensure existing tests pass
- Add integration tests for API endpoints
- Include E2E tests for critical paths

## Documentation

- Update relevant documentation
- Add JSDoc comments for functions
- Include inline comments for complex logic
- Update API documentation if endpoints change

## Branch Naming

Format: `<type>/<description>`

Example: `feature/google-auth`

Types:
- feature/
- bugfix/
- hotfix/
- release/
- docs/

## Issue Reporting

### Bug Reports

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening)

### Feature Requests

**Great Feature Requests** tend to have:

- A clear and detailed description
- The motivation behind this feature
- Possible implementation approaches
- Screenshots or mockups if applicable

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install
   ```

2. Set up pre-commit hooks:
   ```bash
   npm run prepare
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Code Review Process

1. The maintainer reviews PRs regularly
2. Feedback will be given within 5 business days
3. After feedback is addressed, changes will be merged
4. Breaking changes require discussion

## Community

- Join our [Discord](https://discord.gg/gamedin)
- Follow us on [Twitter](https://twitter.com/gamedin)
- Read our [Blog](https://blog.gamedin.xyz)

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
