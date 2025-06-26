# API Documentation

Number Munchers 3D includes a simple Express.js backend for future extensibility and session management.

## Base URL

Development: `http://localhost:5000`
Production: Your deployed domain

## Endpoints

### Health Check

**GET** `/api/health`

Returns the server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-06-26T23:43:00.000Z"
}
```

## Future API Endpoints

The following endpoints are planned for future releases:

### User Management

**POST** `/api/users/register`
- Register a new user account
- Save game progress and statistics

**POST** `/api/users/login`
- User authentication
- Session management

### Game Statistics

**GET** `/api/stats/user/:userId`
- Retrieve user's game statistics
- High scores and achievements

**POST** `/api/stats/game`
- Submit game results
- Update leaderboards

### Educational Content

**GET** `/api/topics`
- List available educational topics
- Dynamic content loading

**GET** `/api/topics/:topicId/challenges`
- Retrieve challenges for specific topic
- Difficulty-based filtering

## Error Handling

All API responses follow a consistent error format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Authentication

Currently, the game runs without authentication. Future versions will implement:

- JWT-based authentication
- Session management
- User role-based access control

## Rate Limiting

Rate limiting will be implemented in future versions to prevent abuse:

- 100 requests per minute per IP
- 1000 requests per hour per authenticated user
- Stricter limits for intensive operations

## Development

To extend the API:

1. Add new routes in `server/routes.ts`
2. Implement database models in `shared/schema.ts`
3. Update API documentation
4. Add corresponding client-side integration

## Client Integration

The frontend uses TanStack Query for API integration:

```typescript
import { apiRequest } from '@/lib/queryClient';

// Example API call
const fetchUserStats = async (userId: string) => {
  return apiRequest(`/api/stats/user/${userId}`, {
    method: 'GET'
  });
};
```