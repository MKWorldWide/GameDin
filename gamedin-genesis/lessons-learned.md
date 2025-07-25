# AWS Amplify Deployment Lessons Learned

## Dependency Management
- **Issue**: React 19 compatibility issues with `cmdk` and other dependencies
- **Solution**: 
  - Pinned React and React DOM to specific versions
  - Added `resolutions` field to enforce consistent versions
  - Created a custom build script with `--legacy-peer-deps`

## AWS Amplify Configuration
- **Build Process**:
  - Custom `build.sh` script provides more control over the build process
  - Using `npm dedupe` in postinstall helps resolve dependency conflicts
  - SSH-based submodule cloning is more reliable than HTTPS

## Environment Variables
- **Best Practice**:
  - Use AWS SSM Parameter Store for sensitive values
  - Keep environment-specific configurations separate
  - Document all required environment variables in `.env.example`

## Caching
- **Optimization**:
  - Cache `node_modules` between builds
  - Cache build artifacts for faster deployments
  - Use `--prefer-offline` flag for faster npm installs

## Monitoring
- **Recommendations**:
  - Set up build notifications
  - Monitor build times and optimize slow steps
  - Keep an eye on deployment logs for recurring issues
