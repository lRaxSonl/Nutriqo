# Contributing to Nutriqo

Thank you for your interest in contributing to **Nutriqo**! We welcome contributions from developers of all skill levels. This document provides guidelines to help you contribute effectively.

## 📋 Code of Conduct

- Be respectful and inclusive
- Welcome all perspectives and ideas
- Report inappropriate behavior to maintainers
- Focus on constructive feedback

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Nutriqo.git
   cd Nutriqo/nutriqo-app
   ```

3. **Add upstream remote** for syncing:
   ```bash
   git remote add upstream https://github.com/lRaxSonl/Nutriqo.git
   ```

4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Install dependencies**:
   ```bash
   npm install
   ```

6. **Set up environment** (see [Configuration](./README.md#configuration)):
   ```bash
   cp .env.example .env.local
   # Edit with your local credentials
   ```

## 💻 Development Workflow

### Running the Application

```bash
# Start development server
npm run dev

# Start in watch mode (auto-rebuild on changes)
npm run dev -- --turbo

# Build for production
npm run build

# Start production server
npm start
```

### Code Quality

```bash
# Run linter
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Debugging

1. **Use Next.js debug mode**:
   ```bash
   DEBUG=nutriqo:* npm run dev
   ```

2. **Browser DevTools**: Chrome/Firefox DevTools for client-side debugging
3. **Server logs**: Check terminal output for API route logs
4. **PocketBase Admin**: [http://localhost:8090/_/](http://localhost:8090/_/) for database inspection

## 📝 Commit Guidelines

### Commit Message Format

```
[TYPE]: Brief description (max 50 chars)

Detailed explanation of the change (if needed).
Multiple paragraphs are OK.

- List specific changes
- Mention related issues/PRs
```

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation update
- `style`: Code formatting (no logic changes)
- `refactor`: Code refactoring
- `perf`: Performance optimization
- `test`: Test additions/updates
- `chore`: Build, dependencies, or tooling
- `ci`: CI/CD configuration

### Examples

```
feat: Add daily nutrition goals UI component

- Create GoalSetter component
- Add API endpoint for goal persistence
- Fix form validation
- Closes #42
```

```
fix: Resolve JWT token expiration issue

The JWT callback was not being called on token refresh.
Added explicit token refresh on every request.
```

## 🔀 Pull Request Process

1. **Update your branch** with latest changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request** on GitHub:
   - Use clear, descriptive title
   - Reference related issues: `Fixes #123`, `Related to #456`
   - Describe changes and motivation
   - Include screenshots for UI changes

4. **PR Checklist**:
   - [ ] Code follows project style guide
   - [ ] Tests added/updated and all pass
   - [ ] No console errors or warnings
   - [ ] Documentation updated
   - [ ] No breaking changes (or documented)
   - [ ] Commits are squashed and logical

5. **Review Process**:
   - Maintainers will review your PR
   - Address feedback promptly
   - Re-request review after updates
   - PR will be merged once approved

## 🏗️ Architecture Guidelines

### FSD (Feature-Sliced Design)

Follow the Feature-Sliced Design architecture:

```
features/my-feature/
├── model/           # Business logic, types, stores
├── lib/             # Helpers, utilities
├── hooks/           # React hooks
├── ui/              # React components
└── index.ts         # Public exports
```

### Adding a New Feature

1. Create feature folder: `src/features/new-feature/`
2. Create subdirectories: `model/`, `lib/`, `ui/`
3. Create `index.ts` with exports
4. Add types to `model/types.ts`
5. Add components to `ui/`
6. Update main `index.ts` for exports
7. Add tests for logic and components

### Component Structure

```typescript
// MyComponent.tsx
import { FC } from 'react';

interface MyComponentProps {
  id: string;
  onAction?: () => void;
}

export const MyComponent: FC<MyComponentProps> = ({ 
  id, 
  onAction 
}) => {
  return (
    <div>
      {/* Implementation */}
    </div>
  );
};
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- MyComponent.test.ts

# Run with coverage
npm run test:coverage
```

### Writing Tests

```typescript
// MyComponent.test.ts
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render component', () => {
    render(<MyComponent id="test" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

**Coverage Target**: Aim for >80% for new code

## 📖 Documentation

### Update Documentation When:
- Adding new features
- Changing API endpoints
- Modifying configuration
- Adding environment variables

### Documentation Files to Update:
- `README.md` (English)
- `README.ru.md` (Russian)
- `README.et.md` (Estonian)
- API comments in route files
- TypeScript JSDoc comments

## 🐛 Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Create detailed bug report** with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (OS, Node version, etc.)
   - Screenshots if applicable
   - Browser console errors

## ✨ Suggesting Features

1. **Check existing issues** and discussions
2. **Create feature request** with:
   - Clear use case and motivation
   - Proposed solution
   - Potential alternatives
   - Impact assessment

## 🔐 Security Issues

**Do not** open public issues for security vulnerabilities.

Instead:
1. Email maintainer directly
2. Include vulnerability details
3. Provide proof of concept if possible
4. Allow time for fix before public disclosure

## 📚 Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **PocketBase Docs**: https://pocketbase.io/docs/
- **NextAuth.js Docs**: https://next-auth.js.org/

## 🎯 Development Priorities

Current focus areas (in order):
1. Bug fixes and stability
2. Test coverage improvement
3. Performance optimization
4. New features
5. Documentation

## 📞 Getting Help

- **GitHub Issues**: For bugs and features
- **GitHub Discussions**: For general questions
- **Pull Request Comments**: For code review feedback

## 🙏 Thank You!

Your contributions make **Nutriqo** better for everyone. We appreciate your time and effort!

---

**Happy coding!** 🚀
