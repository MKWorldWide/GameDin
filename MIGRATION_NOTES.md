# Migration Notes

This document outlines the changes made during the repository rehabilitation and any necessary migration steps.

## 🚀 Major Changes

### 1. CI/CD Pipeline
- **New CI Workflow**: Replaced the existing workflow with a more comprehensive one that includes:
  - PNPM support with caching
  - Matrix testing
  - Code coverage reporting
  - Automated documentation deployment
  - Workflow concurrency controls

### 2. Documentation
- **README.md**: Completely revamped with better structure, badges, and more detailed information
- **CONTRIBUTING.md**: Enhanced with comprehensive contribution guidelines
- **DIAGNOSIS.md**: Added to document the current state and planned improvements

### 3. Tooling
- **Renovate**: Added configuration for automated dependency updates
- **Workflow Hygiene**: Added GitHub Actions workflow to check for common issues
- **EditorConfig**: Ensured consistent editor settings across the team

## 🔄 Migration Steps

### For Developers
1. **Update Node.js**: Ensure you're using Node.js 20.x (as specified in `.nvmrc`)
2. **Switch to PNPM**: The project now uses PNPM as the package manager
   ```bash
   # Install PNPM if you haven't already
   npm install -g pnpm@8.6.0
   
   # Install dependencies
   pnpm install
   ```

3. **Update Environment Variables**: If you had a local `.env` file, ensure it's up to date with any new variables

### For CI/CD
1. **Secrets**: Ensure the following secrets are set in your GitHub repository settings:
   - `CODECOV_TOKEN`: For code coverage reporting
   - `NPM_TOKEN`: If you need to publish packages to npm

2. **Branch Protection**: Consider enabling branch protection for `main`/`master` branches with required status checks

## 🛠 Updated Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm test` | Run tests |
| `pnpm lint` | Lint the code |
| `pnpm format` | Format the code |

## 🔄 Breaking Changes

1. **Package Manager**: The project now uses PNPM instead of npm. Make sure to use `pnpm` commands instead of `npm`.

2. **Node.js Version**: The minimum required Node.js version is now 20.x. Update your local environment if needed.

## 📈 Next Steps

1. Review the new CI/CD pipeline configuration
2. Update any deployment scripts to use PNPM
3. Familiarize yourself with the new contribution guidelines
4. Set up Renovate for automated dependency updates

## ❓ Need Help?

If you encounter any issues during the migration, please open an issue in the repository.

---

Last Updated: 2025-08-29
