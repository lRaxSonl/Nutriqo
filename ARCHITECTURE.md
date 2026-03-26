# Nutriqo Architecture Documentation

This document explains the high-level architecture and design decisions of the **Nutriqo** application.

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│           Nutriqo - Nutrition Tracking Platform             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐        ┌──────────────────┐            │
│  │   Frontend       │        │    Next.js       │            │
│  │   (React 19)     │◄──────►│    API Routes    │            │
│  │                  │        │   (29 routes)    │            │
│  └──────────────────┘        └────────┬─────────┘            │
│                                       │                       │
│  ┌──────────────────┐                 │                       │
│  │  NextAuth.js     │◄────────────────┘                       │
│  │  (JWT strategy)  │                                         │
│  └────────┬─────────┘                                         │
│           │                                                   │
│    ┌──────┴────────┬──────────────┬──────────────┐            │
│    │               │              │              │            │
│    ▼               ▼              ▼              ▼            │
│ ┌────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐         │
│ │PocketB │ │ Stripe   │ │ OpenAI   │ │ External   │         │
│ │ ase    │ │ Payments │ │ GPT-4o   │ │ Services   │         │
│ │(DB)    │ │ API      │ │ Vision   │ └────────────┘         │
│ └────────┘ └──────────┘ └──────────┘                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Architectural Pattern: Feature-Sliced Design (FSD)

The project follows **Feature-Sliced Design** (also known as Screaming Architecture).

### Directory Structure Logic

```
src/
├── app/              # Framework layer (Next.js)
├── entities/         # Core business objects
├── features/         # Feature modules (independent)
├── shared/           # Shared utilities (no business logic)
└── widgets/          # Complex UI compositions
```

### Layer Hierarchy

```
                  ▲
                  │ dependencies
                  │

      entities (business objects)
              ▲
              │
         features (business logic)
              ▲
              │
   shared (utilities, helpers)
              ▲
              │
      app (framework layer)
```

**Rules:**
- ✅ Lower layers can depend on upper layers
- ❌ Upper layers cannot depend on lower layers
- ✅ Layers at same level are independent

### Feature Structure

Each feature (e.g., `auth`, `food-entry`, `payment`) follows this pattern:

```
feature-name/
├── model/
│   ├── types.ts          # TypeScript interfaces/types
│   ├── store.ts          # State management (if needed)
│   └── index.ts
│
├── lib/
│   ├── helpers.ts        # Utility functions
│   ├── validators.ts     # Input validation
│   └── index.ts
│
├── hooks/
│   ├── useFeature.ts     # Custom React hooks
│   └── index.ts
│
├── ui/
│   ├── FeatureComponent.tsx
│   ├── FeatureList.tsx
│   └── index.ts
│
└── index.ts              # Public exports only!
```

## 🔐 Authentication Architecture

### OAuth + Credentials Flow

```
User Action
    │
    ├─► Google Login ─► Google OAuth ─► PocketBase
    │
    └─► Email/Pass ──► PocketBase (direct)
          ↓
    Authenticate User
          ↓
    SignIn Callback
          ├─ Check user exists in PocketBase
          ├─ Create user if first login
          └─ Fetch user role
               ↓
         JWT Callback
          ├─ Sync latest role from PocketBase
          ├─ Store subscription status
          └─ Store PocketBase user ID
               ↓
         Session Callback
          ├─ Copy data from JWT
          └─ Expose to frontend via useSession()
               ↓
         Frontend Components
          ├─ Access role
          ├─ Check admin status
          └─ Determine feature availability
```

### JWT Token Structure

```json
{
  "sub": "user_id",
  "pbUserId": "pocketbase_user_id",
  "role": "user" | "admin",
  "subscriptionStatus": "active" | "inactive",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Key Implementation Details

**File**: `src/app/api/auth/auth.config.ts`

- **SignIn callback**: Creates PocketBase user on first OAuth login
- **JWT callback**: Refreshes role on every request (with 404 graceful fallback)
- **Session callback**: Exposes JWT data to client components

**Security considerations**:
- ✅ Role synced on every request (not cached)
- ✅ JWT secrets handled server-side
- ✅ NextAuth provider in `/api/auth/[...nextauth]`
- ✅ NEXTAUTH_SECRET with cryptographic strength

## 💾 Data Architecture

### PocketBase Collections

#### Users Collection
```typescript
{
  id: string;              // PocketBase ID
  email: string;           // Gmail or custom
  name: string;            // Display name
  password: string;        // Hashed (PocketBase manages)
  role: "user" | "admin";  // Authorization role
  subscriptionStatus: "active" | "inactive";
  created: datetime;
  updated: datetime;
}
```

#### Foods Collection
```typescript
{
  id: string;
  userId: string;          // Foreign key to Users
  name: string;
  category: string;
  protein: number;         // grams
  carbs: number;           // grams
  fat: number;             // grams
  calories: number;        // calculated
  quantity: number;        // grams/ml
  date: string;            // YYYY-MM-DD
  source: "manual" | "ai"; // Entry method
  photoUrl?: string;       // AI analysis photo
}
```

#### Goals Collection
```typescript
{
  id: string;
  userId: string;
  date: string;            // YYYY-MM-DD
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  calorieGoal: number;
  status: "active" | "completed";
}
```

### Data Sync Strategy

```
PocketBase (Single Source of Truth)
    │
    ├─► JWT Token (Server-side cache)
    │
    ├─► Next.js Session (Client-side access)
    │
    └─► React State (Component rendering)
```

**Refresh Cycle**:
1. User requests → JWT callback executes
2. JWT refreshes data from PocketBase
3. Session updated with fresh data
4. Component re-renders with new data

## 🔄 Feature Modules

### Authentication (`src/features/auth/`)

**Components**:
- `LoginForm`: Email/password + Google OAuth form
- `UserMenu`: Displays user profile and logout button

**Workflow**:
1. User enters credentials/clicks Google
2. NextAuth processes authentication
3. Session created with role/subscription data
4. User redirected to dashboard

### Food Tracking (`src/features/add-food-entry/`)

**Components**:
- `AddFoodForm`: Manual food entry
- Food Input with autocomplete
- Nutrition calculation

**Workflow**:
1. User fills form (name, quantity, category)
2. App calculates БЖУ automatically
3. Entry sent to `/api/food/add-entry`
4. Data persisted to PocketBase
5. UI updates with new entry

### Payment Integration (`src/features/payment/`)

**Components**:
- `SubscribeButton`: Triggers checkout
- `PaymentProcessor`: Handles Stripe flow

**Workflow**:
```
User clicks Subscribe
    ↓
POST /api/payment/checkout
    ├─ Create Stripe session
    └─ Return session URL
    ↓
Redirect to Stripe
    ├─ User enters payment info
    └─ Completes payment
    ↓
Stripe webhook
    ├─ Verify payment
    ├─ POST /api/payment/activate-subscription
    ├─ Update subscriptionStatus in PocketBase
    └─ User now has premium access
```

### Admin System (`src/features/admin/`)

**Components**:
- `AdminLink`: Conditional navigation link
- Admin pages in `/app/admin/`

**Authorization**:
```
Is user admin? (session.user.role === "admin")
    ├─ YES → Show admin panel
    │         ├─ Dashboard (statistics)
    │         ├─ Users (management)
    │         ├─ Subscriptions (placeholder)
    │         └─ Activity (placeholder)
    │
    └─ NO → Redirect to login / 403 Forbidden
```

**Admin API** (`src/app/api/admin/`):
- Uses super admin auth: `client.admins.authWithPassword()`
- Bypasses collection-level permissions
- Full database access for admin operations

## 🚀 API Architecture

### Route Organization

```
/api/
├── auth/
│   ├── [...nextauth]/       # NextAuth handler
│   ├── register/            # Email registration
│   └── callback/            # OAuth callback
│
├── food/
│   ├── add-entry/           # POST new food
│   ├── get-entries/         # GET user's foods
│   ├── delete-entry/        # DELETE food
│   └── analyze-photo/       # POST photo analysis (Premium)
│
├── goal/
│   ├── set-daily/           # POST daily goals
│   ├── get-daily/           # GET today's goals
│   ├── get-all/             # GET all user goals
│   ├── update-daily/        # PATCH goals
│   ├── finish-daily/        # POST complete day
│   └── delete-daily/        # DELETE goal
│
├── payment/
│   ├── checkout/            # POST create session
│   └── activate-subscription/  # POST confirm payment
│
├── admin/
│   ├── dashboard/           # GET stats
│   ├── users/               # GET all users
│   └── users/[id]/          # PATCH/DELETE user
│
└── test/
    └── admin-auth/          # GET test endpoint
```

### Error Handling

**Consistent Error Response**:
```typescript
{
  status: "error" | "success";
  code: "ERROR_CODE";
  message: "Human readable message";
  data?: T;
}
```

**Common Error Codes**:
- `UNAUTHORIZED`: Missing/invalid token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource doesn't exist
- `VALIDATION_ERROR`: Invalid input
- `RATE_LIMIT`: Too many requests
- `EXTERNAL_SERVICE_ERROR`: API service down

## 🧪 Testing Architecture

### Test Structure

```
src/
├── app/api/
│   └── food/
│       └── add-entry/
│           ├── route.ts          # Implementation
│           └── route.test.ts     # Tests
│
└── features/
    └── auth/
        ├── ui/
        │   ├── LoginForm.tsx
        │   └── LoginForm.test.tsx
        └── hooks/
            ├── useAuth.ts
            └── useAuth.test.ts
```

### Current Coverage

- **28/28 tests passing** ✅
- Focus areas:
  - БЖУ calculations
  - Statistics aggregation
  - Role-based access control
  - Authentication flow

### Testing Best Practices

```typescript
// Unit test example
describe('calculateBJU', () => {
  it('should calculate correct macronutrients', () => {
    const result = calculateBJU({ name: 'Chicken', weight: 100 });
    expect(result.protein).toBe(31);
    expect(result.carbs).toBe(0);
    expect(result.fat).toBe(3);
  });
});

// Integration test example
describe('POST /api/food/add-entry', () => {
  it('should create food entry with valid token', async () => {
    const response = await POST(req, { params: { userId: 'test' } });
    expect(response.status).toBe(201);
    expect(response.json()).toHaveProperty('data');
  });
});
```

## 🔌 External Integrations

### Google OAuth

**Setup**:
1. Create project in Google Cloud Console
2. Add authorized redirect URIs
3. Get Client ID and Secret
4. Add to `.env.local`

**Flow**:
```
User clicks "Continue with Google"
    ↓
Google login page
    ↓
Redirect to app with auth code
    ↓
NextAuth exchanges code for tokens
    ↓
User data sent to SignIn callback
    ↓
User created in PocketBase (if first login)
```

### OpenAI GPT-4 Vision

**Used for**: Food photo analysis

**Workflow**:
```
User uploads photo
    ↓
POST /api/food/analyze-photo
    ├─ Check premium subscription
    ├─ Send photo to OpenAI
    ├─ Parse response
    └─ Return:
        - Food name
        - Quantity estimate
        - БЖУ values
        - Confidence score
```

### Stripe Payments

**Payment Flow**:
```
"Subscribe" button clicked
    ↓
POST /api/payment/checkout
    ├─ Create Stripe session
    ├─ Store temp session in state
    └─ Return checkout URL
    ↓
Redirect to Stripe Checkout
    ├─ User enters card
    ├─ Completes payment
    └─ Stripe redirects to app
    ↓
Webhook: payment_intent.succeeded
    ├─ Verify payment
    ├─ Activate subscription
    ├─ Update PocketBase
    └─ Notify user
```

## 🔧 Environment-Specific Configuration

### Development
```env
NEXTAUTH_URL=http://localhost:3000
POCKETBASE_URL=http://localhost:8090
# Use Stripe test keys
STRIPE_SECRET_KEY=sk_test_...
```

### Production
```env
NEXTAUTH_URL=https://nutriqo.app
POCKETBASE_URL=https://pb.nutriqo.app
# Use Stripe live keys
STRIPE_SECRET_KEY=sk_live_...
# Enable security headers
# Enable CORS restrictions
```

## 📈 Performance Considerations

### Frontend Optimization
- ✅ Next.js Image optimization
- ✅ Code splitting per route
- ✅ Server-side rendering for critical pages
- ✅ Client-side caching with React Query (if added)

### Backend Optimization
- ✅ PocketBase indexes on userId, date
- ✅ API rate limiting via middleware
- ✅ Webhook batching for payments
- ✅ Caching headers on static content

### Monitoring
- ✅ Error logging
- ✅ Performance metrics
- ✅ User session tracking
- ✅ API response times

## 🔐 Security Architecture

### Authentication Security
- ✅ HTTPS only in production
- ✅ Secure HttpOnly cookies
- ✅ CSRF protection via NextAuth
- ✅ JWT signed with strong secret

### Authorization
- ✅ Role-based access control (user, admin)
- ✅ Per-route authorization checks
- ✅ API token validation on every request
- ✅ Admin routes use super auth

### Data Protection
- ✅ PocketBase password hashing
- ✅ No sensitive data in JWT
- ✅ Encrypted environment variables
- ✅ CORS properly configured

### API Security
- ✅ Input validation on all endpoints
- ✅ Rate limiting
- ✅ Request size limits
- ✅ Error messages don't leak sensitive info

## 📚 Future Architecture Considerations

### Potential Improvements
1. **Caching Layer**: Redis for session/data caching
2. **Microservices**: Separate food analysis service
3. **Message Queue**: Async photo processing
4. **Monitoring**: Datadog or similar APM
5. **CDN**: CloudFlare for static assets
6. **GraphQL**: Alternative to REST API

---

**Last Updated**: March 26, 2026  
**Maintainer**: Nikita Ivkin  
**Status**: Production Ready
