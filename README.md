# GameDin

Welcome to the **GameDin** monorepo. This repository hosts multiple projects that together form a modular gaming platform. Each project is maintained in its own directory with dedicated documentation.

## Projects

| Directory | Description |
|-----------|-------------|
| [`gamedin-ecosystem`](gamedin-ecosystem/) | Main monorepo containing the microservice-based ecosystem and front‑end applications. |
| [`gamedin-genesis`](gamedin-genesis/) | Infrastructure and bootstrap configuration using AWS Amplify. |
| [`packages`](packages/) | Shared libraries such as [`ar-vr-core`](packages/ar-vr-core/) for AR/VR functionality. |

## Getting Started

Each project has its own setup instructions. Start by reading the README inside the directory you are interested in.

```bash
# example
cd gamedin-ecosystem
pnpm install
pnpm dev
```

## Contributing

1. Fork the repository
2. Create a feature branch `git checkout -b feat/my-awesome-feature`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
4. Open a pull request

## License

This project is released under the MIT License.
