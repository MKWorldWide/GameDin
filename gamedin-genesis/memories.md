# Project Memories

## AWS Configuration
- **Amplify App ID**: do37rvqgawigz
- **Region**: us-east-1
- **Domain**: mkww.studio
- **Build Command**: `./build.sh`
- **Output Directory**: `dist`

## Dependencies
- **React**: ^19.0.0
- **Build Tools**: Vite 6.2.0
- **Testing**: Vitest 3.2.4
- **UI**: Radix UI, Tailwind CSS

## Environment Variables
- `VITE_API_URL`: https://api.mkww.studio
- `VITE_APP_ENV`: production

## Security
- Using AWS SSM Parameter Store for secrets
- GitHub SSH authentication for submodules
- Security headers configured in `public/_headers`

## Build Process
1. Initialize Git submodules
2. Install dependencies with `--legacy-peer-deps`
3. Run build script
4. Deploy to AWS Amplify
