# 🚀 Nutriqo Quick Start Guide

Get Nutriqo running locally in **5 minutes**.

## ⚡ Prerequisites

- **Node.js** 18.17+ ([download](https://nodejs.org/))
- **npm** or **pnpm** (included with Node)
- **PocketBase** 0.26.8+ ([download](https://pocketbase.io/))
- **Git** ([download](https://git-scm.com/))

## 📍 Step 1: Clone Repository

```bash
git clone https://github.com/lRaxSonl/Nutriqo.git
cd Nutriqo/nutriqo-app
```

## 🔧 Step 2: Install Dependencies

```bash
npm install
# or if using pnpm
pnpm install
```

## 🗂️ Step 3: Set Up PocketBase

### Option A: Local Development (Recommended)

```bash
# Download PocketBase for your OS from https://pocketbase.io/

# Extract and run
./pocketbase serve
# Opens admin at http://localhost:8090/_/
```

### Option B: Use Existing Instance
- Have a PocketBase server running elsewhere? Skip to Step 4.

### 📋 Create Collections (One-time setup)

1. Go to [http://localhost:8090/_/](http://localhost:8090/_/)
2. Login with demo credentials shown in console
3. Create collections (copy from `shared/lib/models/` folder):
   - **users** - User accounts
   - **foods** - Food entries
   - **goals** - Nutrition goals

Or import included collection schema (if provided).

### 👤 Create Admin User

```bash
# Add to PocketBase collections programmatically
# Or use admin panel: http://localhost:8090/_/users

admin@example.com
password: secure_admin_password
```

## 🔐 Step 4: Configure Environment

```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local  # or use your editor
```

### Minimum Required Variables

```env
# PocketBase
POCKETBASE_URL=http://localhost:8090
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=secure_admin_password

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with: openssl rand -base64 32

# Optional: Stub credentials for development (skip OAuth)
GOOGLE_CLIENT_ID=dummy_dev_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=dummy_dev_secret

# Optional: Stripe development keys
STRIPE_SECRET_KEY=sk_test_dummy
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_dummy

# Optional: OpenAI for photo analysis
OPENAI_API_KEY=sk-proj-dummy
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
# Copy output to .env.local
```

## 🎉 Step 5: Start Development Server

```bash
npm run dev
```

**Server running at**: http://localhost:3000

## ✨ First Steps

1. **Visit the app**: http://localhost:3000
2. **Create account**:
   - Click "Register" or "Login"
   - Use email/password
3. **Explore features**:
   - Add a food entry (e.g., "Chicken 100g")
   - View today's statistics
   - See БЖУ calculations
4. **Admin panel** (optional):
   - Navigate to http://localhost:3000/admin
   - View all users and statistics
   - ⚠️ Only accessible if your account has admin role

## 🧪 Run Tests

```bash
# All tests (28 passing)
npm test

# Watch mode (re-run on changes)
npm run test:watch

# With coverage
npm run test:coverage
```

## 🏗️ Build for Production

```bash
# Create optimized build
npm run build

# Serve production build
npm start
```

## 📝 Common Issues

### "Cannot find PocketBase"
- ❌ PocketBase not running
- ✅ **Fix**: Run `./pocketbase serve`
- ✅ **Check**: Visit http://localhost:8090/

### "401 Unauthorized"
- ❌ JWT credentials missing/invalid
- ✅ **Fix**: Check NEXTAUTH_SECRET in .env.local
- ✅ **Fix**: Verify PocketBase admin email/password

### "Cannot GET /admin"
- ❌ User account not admin
- ✅ **Fix**: Update user role in PocketBase admin
- ✅ **Fix**: Set `role: "admin"` in users collection

### OAuth not working
- ❌ Google OAuth credentials not real
- ✅ **Fix**: Leave as dummy for development
- ✅ **Fix**: Deploy to add real credentials

### External API errors
- ❌ Stripe/OpenAI keys are development stubs
- ✅ **Warning**: Photo analysis & payments won't work
- ✅ **Fix**: Add real keys when needed

## 🐛 Debugging

### View Server Logs
```bash
# Terminal output shows:
# - API requests
# - Database queries
# - Auth events
# - Errors with stack traces
```

### Check PocketBase Admin
- Visit: http://localhost:8090/_/
- Browse users, foods, goals collections
- Check data directly in database

### Browser DevTools (F12)
- **Network tab**: View API requests/responses
- **Console**: JavaScript errors
- **Application**: Session/cookies

## 🎯 Next Steps

1. **Read Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **View Components**: Explore `src/features/` folder
3. **Run Tests**: `npm test` to verify setup
4. **Add Features**: Follow FSD pattern in guide

## 📚 Useful Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Quality
npm run lint         # Check code style
npm test             # Run tests
npm run test:watch   # Tests in watch mode

# Database
# PocketBase admin: http://localhost:8090/_/

# Deployment
npm run build        # Prepare for deployment
# Deploy `/out` folder to Vercel/similar
```

## 🔑 Default Environment Values

| Variable | Default (Dev) | Notes |
|----------|---------------|-------|
| NEXTAUTH_URL | http://localhost:3000 | Change to HTTPS in production |
| POCKETBASE_URL | http://localhost:8090 | Local or remote |
| NODE_ENV | development | Set to `production` on deploy |

## ✅ Verification Checklist

- [x] Node.js installed: `node --version`
- [x] Dependencies installed: `npm ls` (no errors)
- [x] PocketBase running: Accessible at http://localhost:8090
- [x] .env.local created with required variables
- [x] Dev server starts: `npm run dev` (port 3000)
- [x] Can access http://localhost:3000
- [x] Can register/login
- [x] Can add food entries

## 🆘 Still Stuck?

1. **Check existing issues**: https://github.com/lRaxSonl/Nutriqo/issues
2. **Ask in discussions**: https://github.com/lRaxSonl/Nutriqo/discussions
3. **Review ARCHITECTURE**: Deep dive into how it works

---

**Happy coding!** 🎉

Need help with deployment? See [README.md](./README.md#deployment)
