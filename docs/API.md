# GameDin API Documentation

## GraphQL API

### Base URL

```
Production: https://api.gamedin.xyz/graphql
Staging: https://api-staging.gamedin.xyz/graphql
Development: http://localhost:4000/graphql
```

### Authentication

All requests must include an Authorization header with a valid JWT token:

```http
Authorization: Bearer <token>
```

### User Operations

#### Query User Profile

```graphql
query GetUserProfile($userId: ID!) {
  getUser(id: $userId) {
    id
    username
    email
    profile {
      avatar
      bio
      preferences
    }
    games {
      items {
        id
        title
        genre
      }
    }
  }
}
```

#### Update User Profile

```graphql
mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
  updateUserProfile(input: $input) {
    id
    username
    profile {
      avatar
      bio
      preferences
    }
  }
}
```

### Game Operations

#### Query Games List

```graphql
query ListGames(
  $filter: GameFilterInput
  $limit: Int
  $nextToken: String
) {
  listGames(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      title
      genre
      platform
      rating
      reviews {
        items {
          id
          rating
          comment
        }
      }
    }
    nextToken
  }
}
```

#### Add Game Review

```graphql
mutation AddGameReview($input: CreateReviewInput!) {
  createReview(input: $input) {
    id
    gameId
    userId
    rating
    comment
    createdAt
  }
}
```

### Achievement Operations

#### Query User Achievements

```graphql
query GetUserAchievements($userId: ID!) {
  getUserAchievements(userId: $userId) {
    items {
      id
      title
      description
      unlockedAt
      game {
        id
        title
      }
    }
  }
}
```

## REST API Endpoints

### Authentication

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

Response:

```json
{
  "token": "string",
  "refreshToken": "string",
  "expiresIn": "number"
}
```

#### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "string"
}
```

### File Upload

#### Upload Profile Image

```http
POST /upload/profile-image
Content-Type: multipart/form-data

file: <image>
```

Response:

```json
{
  "url": "string",
  "key": "string"
}
```

## WebSocket API

### Connection

```
wss://realtime.gamedin.xyz
```

### Authentication

Include token in connection URL:

```
wss://realtime.gamedin.xyz?token=<jwt_token>
```

### Events

#### Chat Message

```json
{
  "type": "CHAT_MESSAGE",
  "payload": {
    "roomId": "string",
    "message": "string",
    "timestamp": "number"
  }
}
```

#### Game Update

```json
{
  "type": "GAME_UPDATE",
  "payload": {
    "gameId": "string",
    "updateType": "string",
    "data": {}
  }
}
```

## Error Handling

### Error Codes

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

### Error Response Format

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

## Rate Limiting

- API requests: 2000 per IP per hour
- WebSocket messages: 100 per connection per minute
- File uploads: 50 per user per day

## Data Types

### User

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  profile?: UserProfile;
  games?: Game[];
  achievements?: Achievement[];
}
```

### Game

```typescript
interface Game {
  id: string;
  title: string;
  genre: string;
  platform: string;
  rating?: number;
  reviews?: Review[];
}
```

### Review

```typescript
interface Review {
  id: string;
  gameId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}
```

## Best Practices

1. Always include error handling
2. Use pagination for large datasets
3. Implement retry logic for failed requests
4. Cache responses when appropriate
5. Validate input before sending

## SDK Usage

### JavaScript/TypeScript

```typescript
import { GameDinAPI } from '@gamedin/sdk';

const api = new GameDinAPI({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Query user profile
const profile = await api.users.getProfile(userId);

// Update game review
await api.games.updateReview(reviewId, {
  rating: 5,
  comment: 'Great game!'
});
```

## API Versioning

Current version: v1

Version is specified in the URL:
```
https://api.gamedin.xyz/v1/graphql
```

## Support

For API support:
- Email: api@gamedin.xyz
- Documentation: https://docs.gamedin.xyz
- Status: https://status.gamedin.xyz 