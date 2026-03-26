# Changelog

All notable changes to the **Nutriqo** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- [ ] Mobile app (React Native)
- [ ] Barcode scanner for foods
- [ ] Social features (friend tracking, challenges)
- [ ] Advanced recipe builder
- [ ] Email notifications system
- [ ] Password reset functionality
- [ ] Audit logs for admin actions
- [ ] REST API for third-party integrations
- [ ] GraphQL endpoint
- [ ] Multi-language UI support

---

## [0.1.0] - 2026-03-26

### ✨ Added

#### Authentication
- OAuth 2.0 integration with Google
- Email/password registration and login
- JWT-based session management with NextAuth.js
- Role-based access control (user/admin)
- Auto-creation of users on first login

#### Core Features
- Food entry tracking with manual logging
- Automatic БЖУ (macronutrient) calculation
- Daily nutrition statistics and reports
- Weekly statistics and trends
- Daily goal setting and tracking
- Day completion with automatic stats aggregation

#### Premium Features
- Food photo analysis using OpenAI GPT-4 Vision
- Automatic nutritional data extraction from images
- Advanced statistics dashboard

#### Admin System
- Admin dashboard with platform statistics
- User management interface
- Ability to view all users
- Role assignment and revocation
- User deletion capability
- Subscription status monitoring

#### Payment System
- Stripe integration for subscriptions
- $4.99/month premium subscription tier
- Feature gating based on subscription status
- Secure checkout flow

#### UI/UX
- Dark/light theme support with TailwindCSS
- Responsive mobile-first design
- Toast notifications for user feedback
- Form validation and error handling
- Admin sidebar navigation

### 🏗️ Technical Implementation

#### Technology Stack
- **Next.js 16.1.6** with Turbopack
- **React 19.2.3** for UI components
- **TypeScript 5** with strict mode
- **TailwindCSS 4** for styling
- **PocketBase 0.26.8** for backend/database
- **NextAuth.js 4.24.13** for authentication
- **Jest 30.3.0** for testing (28 passing tests)

#### Architecture
- Feature-Sliced Design (FSD) architecture
- Server-side rendering for auth routes
- Client-side components for interactive features
- API routes for backend logic
- Middleware for auth verification

#### API Endpoints
- 29 fully functional routes
- Authentication endpoints
- Food tracking endpoints
- Goal management endpoints
- Payment processing endpoints
- Admin management endpoints
- Test diagnostic endpoints

#### Testing
- 28 unit tests with 100% pass rate
- БЖУ calculation tests
- Statistics aggregation tests
- Role-based access control tests
- Authentication flow tests

### 📁 Project Structure
- Organized with FSD pattern
- Clear separation of concerns
- Reusable components in `/shared`
- Feature modules in `/features`
- Entity models in `/entities`
- Widgets for complex compositions

### 📚 Documentation
- Comprehensive README.md (English)
- README.ru.md (Russian translation)
- README.et.md (Estonian translation)
- ARCHITECTURE.md (technical architecture)
- CONTRIBUTING.md (contribution guidelines)
- QUICKSTART.md (getting started guide)
- CHANGELOG.md (this file)

### 🔐 Security
- Secure JWT token handling
- NextAuth CSRF protection
- Role-based authorization on all admin routes
- Input validation on API endpoints
- Secure password storage via PocketBase
- Environment variable protection for secrets

### 🚀 Performance
- Next.js Turbopack for fast builds
- Code splitting per route
- Optimized database queries with PocketBase
- Caching headers configuration
- Production-ready build optimization

### 🐛 Bug Fixes

#### Critical Fixes
- **Session Sync**: Fixed JWT callback to sync role on every request
  - Previously: Role changes in PocketBase not reflected until next login
  - Now: Role refreshed on each API request with graceful 404 fallback

- **Admin User Visibility**: Fixed admin panel showing 0 users
  - Root cause: Using user token with collection-level permissions
  - Solution: Implemented super admin authentication via client.admins.authWithPassword()

#### Minor Fixes
- Calorie calculation persistence
- Food entry deletion
- Goal update validation
- Theme preference storage

### ✅ Quality Assurance
- ESLint configuration for code consistency
- TypeScript strict mode enabled
- Comprehensive error logging throughout
- Input validation on all API endpoints
- Test coverage for critical business logic

### 📖 Initial Release Features
- Production-ready deployment ready
- MIT licensed open source
- GitHub repository published
- Development documentation complete
- Contribution guidelines established

---

## Version Information

- **Current Version**: 0.1.0
- **Release Date**: March 26, 2026
- **Status**: Beta (Production Ready)
- **License**: MIT

## Attribution

This project was primarily developed with AI assistance (Claude) in collaboration with human developers. The codebase demonstrates modern full-stack development practices using AI-aided development workflows.

### Contributors
- **AI Development**: Claude (Anthropic)
- **Project Lead**: Nikita Ivkin (@lRaxSonl)
- **Infrastructure**: PocketBase, Stripe, OpenAI

### Key Dependencies
- Next.js team for the framework
- Vercel for deployment platform
- TailwindCSS for styling framework
- TypeScript team for type safety
- PocketBase authors for database solution
- OpenAI for Vision API

---

## Migration Guide

### From v0.0.x to v0.1.0

If upgrading from earlier versions:

1. **Database**: Migrate PocketBase collections
   ```bash
   # Export old data
   # Create new collections per SCHEMA
   # Import data
   ```

2. **Environment**: Update `.env.local`
   ```env
   # Add new required variables
   NEXTAUTH_URL=your_app_url
   NEXTAUTH_SECRET=new_secret
   ```

3. **Features**: Enable new features
   - Stripe: Configure webhook endpoints
   - OpenAI: Add API key for photo analysis
   - Google OAuth: Add OAuth credentials

---

## Support

For issues, feature requests, or documentation:
- **GitHub Issues**: [Report issues](https://github.com/lRaxSonl/Nutriqo/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/lRaxSonl/Nutriqo/discussions)
- **README**: [Read documentation](./README.md)

---

## Roadmap

### Phase 2 (Q2 2026)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Social features

### Phase 3 (Q3 2026)
- [ ] Barcode scanner integration
- [ ] Cloud backup
- [ ] Multi-device sync

### Phase 4+ (Future)
- [ ] Machine learning for meal recommendations
- [ ] Integration with fitness trackers
- [ ] Nutritionist consultation features

---

**Made with ❤️ using AI & TypeScript**
