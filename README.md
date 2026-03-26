# 🍎 Nutriqo - AI-Powered Nutrition Tracking Application

**README Translations:** [Russian (Русский)](./README.ru.md) | [Estonian (Eesti)](./README.et.md)

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)
![AI-Powered](https://img.shields.io/badge/AI--Powered-OpenAI-FF6B6B)

> **⚠️ Note:** This project was primarily written using AI (Claude) in collaboration with a human developer. The codebase demonstrates modern full-stack development practices with AI assistance.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

**Nutriqo** is a modern nutrition tracking application that uses AI to analyze food photos and help users maintain a balanced diet. The app provides real-time nutritional analysis (proteins, fats, carbohydrates), goal tracking, and premium subscription features with Stripe integration.

### Key Highlights

- 🤖 **AI Photo Analysis**: Uses OpenAI's GPT-4 Vision to analyze food photos and extract nutritional data
- 📊 **Advanced Statistics**: Track БЖУ (proteins, fats, carbohydrates) with comprehensive daily/weekly reports
- 💳 **Premium Subscriptions**: Stripe integration for $4.99/month premium features
- 🔐 **Secure Authentication**: OAuth (Google) + Email/Password with NextAuth.js
- 👮 **Admin Dashboard**: Role-based access control with user management
- 🌗 **Dark/Light Theme**: Theme switching with persistent user preferences
- 📱 **Responsive Design**: Mobile-first approach with TailwindCSS
- ⚡ **High Performance**: Next.js 16 with Turbopack for lightning-fast builds

## ✨ Features

### User Features
- ✅ Food entry tracking with manual and AI-assisted photo upload
- ✅ Automatic БЖУ (macronutrient) calculation and logging
- ✅ Daily/weekly nutrition statistics and goal tracking
- ✅ Set and manage daily nutritional goals
- ✅ Complete-day action with automatic final stats
- ✅ Profile management and subscription status
- ✅ Dark/Light theme with persistent settings

### Premium Features (Subscription Required)
- ✅ Food photo analysis with OpenAI GPT-4 Vision
- ✅ AI-powered food detection and nutritional extraction
- ✅ Advanced statistics and trend analysis
- ✅ Priority support

### Admin Features
- ✅ Dashboard with platform statistics
- ✅ Complete user directory with role management
- ✅ Ability to promote users to admin status
- ✅ User deletion and account management
- ✅ View subscription and activity metrics
- ✅ Monitor conversion rates and platform health

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16.1.6 (Turbopack)
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: TailwindCSS 4
- **Icons**: Lucide React
- **Theme**: next-themes
- **Notifications**: react-hot-toast

### Backend & Services
- **Runtime**: Node.js
- **Database**: PocketBase 0.26.8
- **Authentication**: NextAuth.js 4.24.13
- **Payments**: Stripe API
- **AI**: OpenAI GPT-4o (Vision capability)
- **HTTP Client**: Custom axios-based wrapper

### DevOps & Tools
- **Package Manager**: npm/pnpm
- **Testing**: Jest 30.3.0
- **Linting**: ESLint 9
- **Type Checking**: TypeScript & Pylance
- **Environment**: .env.local for secrets

## 📁 Project Structure

```
nutriqo-app/
├── src/
│   ├── app/                          # Next.js app directory
│   │   ├── api/                      # API routes (29 endpoints)
│   │   │   ├── auth/                 # Authentication routes
│   │   │   ├── food/                 # Food tracking routes
│   │   │   ├── goal/                 # Goal management routes
│   │   │   ├── payment/              # Stripe integration
│   │   │   ├── admin/                # Admin dashboard API
│   │   │   └── test/                 # Testing endpoints
│   │   ├── admin/                    # Admin UI pages
│   │   ├── login/                    # Login page
│   │   ├── profile/                  # User profile
│   │   ├── statistics/               # Stats dashboard
│   │   └── globals.css               # Global styles
│   │
│   ├── entities/                     # Business entities (FSD)
│   │   ├── food/                     # Food entity
│   │   └── user/                     # User entity
│   │
│   ├── features/                     # Feature modules (FSD)
│   │   ├── add-food-entry/           # Food entry form
│   │   ├── auth/                     # Auth components
│   │   ├── payment/                  # Payment integration
│   │   ├── set-daily-goals/          # Goal setting
│   │   └── admin/                    # Admin features
│   │
│   ├── shared/                       # Shared utilities
│   │   ├── api/                      # HTTP client
│   │   ├── auth/                     # Auth utilities
│   │   ├── lib/                      # Helper functions
│   │   ├── providers/                # React providers
│   │   ├── theme/                    # Theme configuration
│   │   └── ui/                       # Reusable UI components
│   │
│   └── widgets/                      # Complex UI widgets
│       ├── daily-tracker/            # Daily tracking widget
│       └── header/                   # Header component
│
├── types/
│   └── next-auth.d.ts                # NextAuth type definitions
│
├── public/                           # Static assets
├── config files                      # tsconfig, jest, tailwind, etc.
└── package.json
```

### Architecture Pattern: FSD (Feature-Sliced Design)

This project follows the **Feature-Sliced Design** architecture:
- **entities/**: Core business objects (User, Food, etc.)
- **features/**: Independent business features
- **shared/**: Shared code with no business logic
- **widgets/**: Complex UI components combining multiple features

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.17
- npm or pnpm
- A PocketBase instance (local or hosted)
- OpenAI API key (for photo analysis)
- Google OAuth credentials
- Stripe API keys

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lRaxSonl/Nutriqo.git
   cd Nutriqo/nutriqo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure environment variables** (see [Configuration](#configuration))
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   # Server runs at http://localhost:3000
   ```

5. **Access the application**
   - Open http://localhost:3000
   - Register or login with Google OAuth
   - Start tracking your nutrition!

### Build for Production

```bash
npm run build      # Create optimized build
npm start          # Start production server
```

## ⚙️ Configuration

### Required Environment Variables

Create `.env.local` in `nutriqo-app/` directory:

```env
# === POCKETBASE (Database & Auth) ===
POCKETBASE_URL=http://pocketbase-url.com
POCKETBASE_ADMIN_EMAIL=admin@email.com
POCKETBASE_ADMIN_PASSWORD=admin_secure_password

# === NEXTAUTH Configuration ===
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with: openssl rand -base64 32

# === GOOGLE OAUTH ===
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# === STRIPE (Payments) ===
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# === OPENAI (Food Photo Analysis) ===
OPENAI_API_KEY=sk-proj-...
```

### Optional Environment Variables

```env
# PocketBase Users Collection Name
POCKETBASE_USERS_COLLECTION=users

# Newsletter/Email settings (if implemented)
NODE_ENV=development
```

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
Most endpoints require `Authorization: Bearer <token>` header.

### Key Endpoints

#### Food Management
- `POST /api/food/add-entry` - Add new food entry
- `GET /api/food/get-entries` - List user's food entries
- `DELETE /api/food/delete-entry` - Remove food entry
- `POST /api/food/analyze-photo` - Analyze food photo (Premium)

#### Goals Management
- `POST /api/goal/set-daily` - Set daily nutritional goals
- `GET /api/goal/get-daily` - Get today's goals
- `GET /api/goal/get-all` - Get all user goals
- `PATCH /api/goal/update-daily` - Update daily goals
- `POST /api/goal/finish-daily` - Complete day and get stats
- `DELETE /api/goal/delete-daily` - Remove specific goal

#### Payment
- `POST /api/payment/checkout` - Create Stripe checkout session
- `POST /api/payment/activate-subscription` - Activate subscription after payment

#### Admin (Requires admin role)
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/[id]` - Update user role
- `DELETE /api/admin/users/[id]` - Delete user

See `src/app/api/*/route.ts` files for complete endpoint specifications.

## 🏗️ Architecture

### Authentication Flow

```
User Login → NextAuth Session
    ↓
OAuth/Credentials Provider
    ↓
SignIn Callback (Creates/finds PocketBase user)
    ↓
JWT Callback (Syncs role, subscription status)
    ↓
Session Callback (Propagates to frontend)
    ↓
useSession() Hook on Client Components
```

### Data Sync Strategy

```
PocketBase (Source of Truth)
    ↓
JWT Token (Temporary cache)
    ↓
NextAuth Session (Frontend access)
    ↓
React Component State
```

### Subscription System

```
User clicks Subscribe
    ↓
Stripe Checkout Session Created
    ↓
User completes payment
    ↓
activate-subscription endpoint
    ↓
subscriptionStatus set to 'active' in PocketBase
    ↓
JWT callback refreshes & syncs to session
    ↓
Paywall disappears, features unlock
```

## 👨‍💻 Development

### Running Tests

```bash
# Run all tests once
npm test

# Watch mode (re-run on changes)
npm run test:watch

# With coverage report
npm run test:coverage
```

### Linting

```bash
npm run lint
```

### Project Statistics
- **29 API Routes**: Fully functional endpoints
- **28+ Unit Tests**: Comprehensive test coverage
- **3 Languages**: English, Russian, Estonian documentation
- **Type Safe**: 100% TypeScript with strict mode
- **CI/CD Ready**: Build artifacts optimized for deployment

### Code Quality Standards
- ✅ TypeScript strict mode enabled
- ✅ ESLint configured for best practices
- ✅ Comprehensive error logging
- ✅ Input validation on all API endpoints
- ✅ Secure authentication throughout

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Connect GitHub repo to Vercel
# Configure environment variables in Vercel Dashboard
# Auto-deploy on push to main branch
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next standalone /app
CMD ["npm", "start"]
```

### Environment-Specific Deployment

1. **Development**: `npm run dev` (local machine)
2. **Staging**: Deploy to staging environment with test data
3. **Production**: Deploy with real PocketBase and Stripe credentials
   - Use secure secret management (Vercel, GitLab CI, etc.)
   - Enable production monitoring
   - Configure CORS for your domain

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive
- Comment complex business logic

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AI Development**: This project was primarily developed with AI assistance (Claude)
- **OpenAI**: GPT-4 Vision model for food analysis
- **Stripe**: Payment processing
- **Next.js Team**: Excellent framework and documentation
- **PocketBase**: Simplified backend solution
- **TailwindCSS**: Utility-first CSS framework
- **TypeScript**: Type safety and developer experience

## 📞 Support

- 📧 GitHub Issues: [Report bugs](https://github.com/lRaxSonl/Nutriqo/issues)
- 💬 Discussions: [Ask questions](https://github.com/lRaxSonl/Nutriqo/discussions)
- 📖 Documentation: Check this README and `/src` comments

## 🚀 Future Roadmap

- [ ] Mobile app (React Native)
- [ ] Barcode scanner for foods
- [ ] Social features (friend tracking, challenges)
- [ ] REST API for third-party integrations
- [ ] Advanced recipe builder
- [ ] Meal planning AI
- [ ] Integration with fitness trackers
- [ ] Multi-language UI support

---

**Last Updated:** March 26, 2026  
**Made with ❤️ using AI & TypeScript**
