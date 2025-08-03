# gamedin-ecosystem

The **gamedin-ecosystem** module powers the user-facing microservices and front-end applications. Its architecture encourages modularity and scalability.

```mermaid
graph TD
    A[Web Client] -->|HTTPS| B[API Gateway]
    B --> C[Auth Service]
    B --> D[Gameplay Service]
    D --> E[(Game DB)]
    C --> F[(User DB)]
```

Each service is isolated for security and can be deployed independently to align with battle angel protocol ambitions.
