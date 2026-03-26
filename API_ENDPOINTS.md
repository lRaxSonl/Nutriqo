# API Endpoints Documentation

Complete reference for all **Nutriqo** API endpoints.

**Base URL**: `http://localhost:3000/api` (or your deployment URL)

## 🔐 Authentication

### Required Headers

All endpoints except `/auth/*` require:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Get JWT Token

1. Call login endpoint (see below)
2. JWT included in session (NextAuth.js handles automatically)
3. For external API clients: Extract from `/api/auth/session`

---

## 🔑 Authentication Endpoints

### POST `/auth/register`

Register new user with email/password.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "name": "John Doe"
}
```

**Response** (201):
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**Errors**:
- 400: Email already exists
- 400: Invalid email format
- 400: Password too short

---

### POST `/auth/login`

Login with email/password. (Handled by NextAuth.js)

**Through NextAuth**:
```javascript
await signIn('credentials', {
  email: 'user@example.com',
  password: 'password'
});
```

**Response**: NextAuth.js handles session creation

---

## 🍔 Food Endpoints

### POST `/food/add-entry`

Add new food entry to today's log.

**Request**:
```json
{
  "name": "Chicken Breast",
  "quantity": 100,
  "unit": "grams",
  "protein": 31,
  "carbs": 0,
  "fat": 3.6,
  "calories": 165,
  "category": "protein"
}
```

**Response** (201):
```json
{
  "status": "success",
  "message": "Food entry added",
  "data": {
    "id": "food_id",
    "userId": "user_id",
    "name": "Chicken Breast",
    "protein": 31,
    "carbs": 0,
    "fat": 3.6,
    "calories": 165,
    "date": "2026-03-26",
    "source": "manual"
  }
}
```

**Errors**:
- 400: Missing required fields
- 401: Unauthorized
- 422: Invalid values

---

### GET `/food/get-entries`

Get all food entries for authenticated user.

**Query Parameters**:
| Param | Type | Required | Default |
|-------|------|----------|---------|
| date | YYYY-MM-DD | No | Today |
| limit | number | No | 100 |
| sort | asc\|desc | No | desc |

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "entries": [
      {
        "id": "food_id_1",
        "name": "Chicken Breast",
        "quantity": 100,
        "protein": 31,
        "carbs": 0,
        "fat": 3.6,
        "calories": 165,
        "date": "2026-03-26",
        "source": "manual"
      }
    ],
    "totals": {
      "protein": 31,
      "carbs": 0,
      "fat": 3.6,
      "calories": 165
    }
  }
}
```

---

### DELETE `/food/delete-entry`

Delete food entry by ID.

**Request**:
```json
{
  "id": "food_id"
}
```

**Response** (200):
```json
{
  "status": "success",
  "message": "Food entry deleted"
}
```

**Errors**:
- 404: Entry not found
- 401: Not owner of entry

---

### POST `/food/analyze-photo`

**⭐ Premium Feature** - Analyze food photo and extract nutritional data.

**Request** (multipart/form-data):
```
file: <image_file>
quantity: 100 (optional)
unit: grams (optional)
```

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "name": "Grilled Chicken",
    "quantity": "~150g",
    "confidence": 0.95,
    "nutrition": {
      "protein": 45,
      "carbs": 2,
      "fat": 8,
      "calories": 270
    },
    "photoUrl": "https://..."
  }
}
```

**Errors**:
- 401: User not premium subscriber
- 400: Invalid image file
- 503: OpenAI service unavailable

---

## 🎯 Goal Endpoints

### POST `/goal/set-daily`

Set daily nutrition goals for user.

**Request**:
```json
{
  "proteinGoal": 100,
  "carbsGoal": 250,
  "fatGoal": 70,
  "calorieGoal": 2000,
  "date": "2026-03-26"
}
```

**Response** (201):
```json
{
  "status": "success",
  "data": {
    "id": "goal_id",
    "userId": "user_id",
    "date": "2026-03-26",
    "proteinGoal": 100,
    "carbsGoal": 250,
    "fatGoal": 70,
    "calorieGoal": 2000,
    "status": "active"
  }
}
```

---

### GET `/goal/get-daily`

Get today's goals.

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "id": "goal_id",
    "proteinGoal": 100,
    "carbsGoal": 250,
    "fatGoal": 70,
    "calorieGoal": 2000,
    "eaten": {
      "protein": 45,
      "carbs": 120,
      "fat": 30,
      "calories": 950
    },
    "remaining": {
      "protein": 55,
      "carbs": 130,
      "fat": 40,
      "calories": 1050
    },
    "percentage": {
      "protein": 45,
      "carbs": 48,
      "fat": 43,
      "calories": 47
    }
  }
}
```

---

### GET `/goal/get-all`

Get all goals for user.

**Response** (200):
```json
{
  "status": "success",
  "data": [
    {
      "id": "goal_id_1",
      "date": "2026-03-26",
      "proteinGoal": 100,
      "carbsGoal": 250,
      "fatGoal": 70,
      "calorieGoal": 2000,
      "status": "active"
    }
  ]
}
```

---

### PATCH `/goal/update-daily`

Update today's goals.

**Request**:
```json
{
  "proteinGoal": 120,
  "calorieGoal": 2200
}
```

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "id": "goal_id",
    "proteinGoal": 120,
    "calorieGoal": 2200
  }
}
```

---

### POST `/goal/finish-daily`

Complete the day and get final statistics.

**Request** (no body needed):

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "date": "2026-03-26",
    "totalProtein": 95,
    "totalCarbs": 245,
    "totalFat": 68,
    "totalCalories": 1950,
    "goals": {
      "protein": 100,
      "carbs": 250,
      "fat": 70,
      "calories": 2000
    },
    "completion": {
      "protein": "95%",
      "carbs": "98%",
      "fat": "97%",
      "calories": "97%"
    }
  }
}
```

---

### DELETE `/goal/delete-daily`

Delete specific goal by ID.

**Request**:
```json
{
  "id": "goal_id"
}
```

**Response** (200):
```json
{
  "status": "success",
  "message": "Goal deleted"
}
```

---

## 💳 Payment Endpoints

### POST `/payment/checkout`

Create Stripe checkout session for subscription.

**Request** (no body needed):

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/pay/cs_test_..."
  }
}
```

**Errors**:
- 401: User not authenticated
- 409: Already subscribed

---

### POST `/payment/activate-subscription`

Activate subscription after payment (called by webhook).

**Request**:
```json
{
  "sessionId": "cs_test_..."
}
```

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "subscriptionStatus": "active",
    "expiresAt": "2026-04-26T00:00:00Z"
  }
}
```

**Errors**:
- 400: Invalid session
- 404: Session not found

---

## 👨‍💼 Admin Endpoints

**⚠️ Requires admin role**

### GET `/admin/dashboard`

**⭐ Admin Only** - Get dashboard statistics.

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "totalUsers": 1250,
    "activeUsers": 850,
    "premiumSubscribers": 320,
    "freeUsers": 930,
    "totalFoods": 45230,
    "averageEntriesPerUser": 36,
    "conversionRate": "25.6%",
    "lastUpdated": "2026-03-26T10:30:00Z"
  }
}
```

---

### GET `/admin/users`

**⭐ Admin Only** - List all users.

**Query Parameters**:
| Param | Type | Default |
|-------|------|---------|
| page | number | 1 |
| limit | number | 50 |
| role | user\|admin | all |
| search | string | none |

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "user_id_1",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "user",
        "subscriptionStatus": "active",
        "createdAt": "2026-01-15T00:00:00Z",
        "lastActive": "2026-03-26T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1250,
      "pages": 25
    }
  }
}
```

---

### GET `/admin/users/[id]`

**⭐ Admin Only** - Get specific user details.

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "subscriptionStatus": "active",
    "createdAt": "2026-01-15T00:00:00Z",
    "lastActive": "2026-03-26T10:30:00Z",
    "stats": {
      "totalFoodEntries": 150,
      "avgEntriesPerDay": 5,
      "totalDaysActive": 32,
      "lastEntryDate": "2026-03-26"
    }
  }
}
```

---

### PATCH `/admin/users/[id]`

**⭐ Admin Only** - Update user (role, subscription, etc).

**Request**:
```json
{
  "role": "admin",
  "subscriptionStatus": "active"
}
```

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "id": "user_id",
    "role": "admin",
    "subscriptionStatus": "active"
  }
}
```

---

### DELETE `/admin/users/[id]`

**⭐ Admin Only** - Delete user account.

**Response** (200):
```json
{
  "status": "success",
  "message": "User deleted"
}
```

**Errors**:
- 404: User not found
- 409: Cannot delete last admin

---

## 🧪 Test Endpoints

### GET `/test/admin-auth`

Test endpoint to verify admin authentication configuration.

**Response** (200):
```json
{
  "status": "success",
  "message": "Admin authentication working",
  "data": {
    "adminConnected": true,
    "usersCount": 1250,
    "permissionLevel": "full"
  }
}
```

**Debug Info**:
- Confirms PocketBase connection
- Lists all users (for diagnostics)
- Shows admin access level

---

## 📝 Error Response Format

All endpoints follow consistent error format:

```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "Human readable error message",
  "details": {
    "field": "error_description"
  }
}
```

### Common Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| UNAUTHORIZED | 401 | Missing/invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input data |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMIT | 429 | Too many requests |
| EXTERNAL_SERVICE_ERROR | 503 | Third-party service down |

---

## 🔄 Rate Limiting

- **Limit**: 100 requests per minute per user
- **Headers**: `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **When exceeded**: 429 status code

---

## 📊 Pagination

Endpoints supporting pagination use this format:

**Query**:
```
GET /api/admin/users?page=2&limit=50
```

**Response**:
```json
{
  "status": "success",
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 1250,
    "pages": 25
  }
}
```

---

## 🔒 Security Notes

1. **Always use HTTPS** in production
2. **Store tokens securely** in HttpOnly cookies (NextAuth.js handles)
3. **Never expose secrets** in logs
4. **Validate input** client and server side
5. **Role check** before admin operations

---

## 💡 Usage Examples

### cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass","name":"User"}'

# Add food
curl -X POST http://localhost:3000/api/food/add-entry \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Chicken","quantity":100,"protein":31,"carbs":0,"fat":3.6,"calories":165}'

# Get foods
curl -X GET http://localhost:3000/api/food/get-entries \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### JavaScript/Fetch

```javascript
// Add food entry
const response = await fetch('/api/food/add-entry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Include cookies
  body: JSON.stringify({
    name: 'Chicken',
    quantity: 100,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    calories: 165
  })
});

const data = await response.json();
console.log(data);
```

---

## 📞 API Status

- **Status Page**: https://status.nutriqo.app (when deployed)
- **Uptime**: 99.9% SLA
- **Response Time**: < 200ms average

---

**Last Updated**: March 26, 2026  
**Version**: 0.1.0  
**Made with ❤️ using TypeScript**
