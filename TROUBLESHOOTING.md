# Troubleshooting Guide

Solutions for common issues encountered when developing or deploying **Nutriqo**.

## 🔍 General Debugging Steps

1. **Check logs**: Terminal output for errors
2. **Clear cache**: `rm -rf .next node_modules`
3. **Reinstall deps**: `npm install`
4. **Check config**: Verify `.env.local` variables
5. **Test services**: Ensure PocketBase/Stripe/OpenAI are running

---

## 🚀 Development Server Issues

### Port 3000 Already in Use

**Problem**: `Error: listen EADDRINUSE :::3000`

**Solutions**:
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001

# Or on Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

### Cannot Find Module '@next/env'

**Problem**: `Cannot find module '@next/env'`

**Solutions**:
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Or force rebuild
npm install @next/env --force
```

---

### Hot Reload Not Working

**Problem**: Code changes don't trigger hot reload

**Solutions**:
1. Check file is in `src/` directory
2. Restart dev server: `npm run dev`
3. Check `.next` folder exists
4. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

---

## 🔐 Authentication Issues

### 401 Unauthorized Errors

**Problem**: All API requests return 401

**Causes & Solutions**:

1. **Missing .env.local**
   ```bash
   cp .env.example .env.local
   # Edit with real credentials
   ```

2. **Invalid NEXTAUTH_SECRET**
   ```bash
   # Generate new secret
   openssl rand -base64 32
   # Update .env.local
   ```

3. **Session Expired**
   - Clear browser cookies
   - Logout and login again
   - Check NEXTAUTH_URL in .env.local

---

### "Cannot read property 'user' of null" (useSession)

**Problem**: `session` is null even after login

**Causes & Solutions**:

1. **Not wrapped in SessionProvider**
   ```typescript
   // Check src/app/providers.tsx
   import { SessionProvider } from "next-auth/react";
   
   export function Providers({ children }) {
     return <SessionProvider>{children}</SessionProvider>;
   }
   ```

2. **Token not signed correctly**
   - Verify NEXTAUTH_SECRET is set
   - Logout and login to refresh token

3. **Browser blocking cookies**
   - Check DevTools → Application → Cookies
   - Allow cookies for localhost

---

### Google OAuth Not Working

**Problem**: Google login button does nothing or shows error

**Causes & Solutions**:

1. **Development (Dummy Credentials)**
   ```env
   GOOGLE_CLIENT_ID=dummy_dev_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=dummy_dev_secret
   ```
   ⚠️ Photo analysis won't work with dummy credentials

2. **Getting Real Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create project
   - Enable OAuth 2.0
   - Add redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID and Secret to .env.local

3. **Redirect URI Mismatch**
   - Check Google Console matches your app URL
   - For production: `https://your-domain.com/api/auth/callback/google`

---

## 🗄️ Database Issues

### "Cannot connect to PocketBase"

**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:8090`

**Solutions**:

1. **PocketBase Not Running**
   ```bash
   # Start PocketBase
   ./pocketbase serve
   # Should see: "Server started at http://127.0.0.1:8090"
   ```

2. **Wrong URL in .env.local**
   ```env
   POCKETBASE_URL=http://localhost:8090  # Check spelling
   ```

3. **Firewall Blocking**
   - Allow port 8090 through firewall
   - Check antivirus isn't blocking connection

---

### "Users collection not found"

**Problem**: `Error: Collection 'users' does not exist`

**Solutions**:

1. **Create Users Collection**
   - Go to PocketBase admin: http://localhost:8090/_/
   - Click "New collection"
   - Name: `users`
   - Add fields: email, name, password, role, subscriptionStatus

2. **Verify Schema**
   ```typescript
   // Check src/shared/lib/models/User.ts
   // Ensure all fields match PocketBase schema
   ```

---

### Admin Queries Return Empty

**Problem**: Admin sees 0 users despite users existing

**Causes & Solutions**:

1. **Admin Credentials Wrong**
   ```env
   POCKETBASE_ADMIN_EMAIL=admin@example.com
   POCKETBASE_ADMIN_PASSWORD=correct_password
   ```

2. **Check Admin User Exists**
   - Go to http://localhost:8090/_/
   - View users collection
   - Verify admin account is there

3. **Collection Permissions**
   - In PocketBase admin panel
   - Check collection permissions aren't too restrictive

---

## 💳 Payment Issues

### "Stripe API Key Invalid"

**Problem**: Stripe requests return 401

**Solutions**:

1. **Get Real Keys**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Retrieve Secret and Publishable keys
   - Use `sk_test_` for development

2. **Update .env.local**
   ```env
   STRIPE_SECRET_KEY=sk_test_real_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_real_key
   ```

3. **Restart Dev Server**
   ```bash
   npm run dev
   # Env variables loaded at startup
   ```

---

### Stripe Checkout Fails

**Problem**: Checkout button shows blank page or error

**Causes & Solutions**:

1. **Check Keys Match Product**
   - Test keys work with test mode toggle
   - Live keys only work in production

2. **CORS Issues**
   - Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
   - Check browser console for errors

3. **Webhook Not Configured**
   - Stripe won't process after-paid events
   - Configure webhook in Stripe dashboard
   - Add URL: `https://your-domain.com/api/webhooks/stripe`

---

## 🤖 OpenAI / Photo Analysis Issues

### "OpenAI API Key Invalid"

**Problem**: Photo analysis returns 401

**Solutions**:

1. **Get Real Key**
   - Go to [OpenAI Platform](https://platform.openai.com/account/api-keys)
   - Create new secret key
   - Never commit to git!

2. **Update .env.local**
   ```env
   OPENAI_API_KEY=sk-proj-real_key
   ```

3. **Check Usage**
   - Visit OpenAI dashboard
   - Verify you have API credits
   - Check rate limits

---

### Photo Analysis Returns Errors

**Problem**: Uploading food photo gives error

**Causes & Solutions**:

1. **Premium Subscription Required**
   - Ensure `subscriptionStatus: "active"` in PocketBase
   - Subscribe via Stripe first

2. **Image Too Large**
   - Limit: 4MB per image
   - Compress image if needed

3. **OpenAI Service Down**
   - Check [OpenAI Status](https://status.openai.com/)
   - Retry later

4. **Vision Model Not Available**
   - Ensure `gpt-4-vision` or `gpt-4o` available in account
   - May need API credits ($5 minimum)

---

## 🧪 Testing Issues

### "Jest Tests Failing"

**Problem**: `npm test` shows failures

**Solutions**:

1. **Check Dependencies**
   ```bash
   npm install --save-dev jest @testing-library/react
   ```

2. **Wrong Node Version**
   ```bash
   node --version  # Should be 18.17+
   ```

3. **Test File Issues**
   - Tests in `*.test.ts` or `*.test.tsx`
   - Jest config in `jest.config.js`
   - Try: `npm test -- --verbose`

---

### "Cannot Find Test Files"

**Problem**: Jest doesn't find tests

**Solutions**:

1. **Verify jest.config.js**
   ```javascript
   // Should include:
   testMatch: ['**/*.test.ts', '**/*.test.tsx']
   ```

2. **Create Test Folder**
   ```bash
   mkdir -p src/__tests__
   npm test
   ```

---

## 🏗️ Build Issues

### "Build Fails: Cannot Find Type"

**Problem**: TypeScript compilation error during build

**Solutions**:

1. **Check tsconfig.json**
   ```bash
   cat tsconfig.json | grep "strict"
   # Should show: "strict": true
   ```

2. **Add Type Definition**
   ```typescript
   // src/types/custom.d.ts
   declare module '@package-name' {
     export interface MyType { }
   }
   ```

3. **Update type dependencies**
   ```bash
   npm install --save-dev @types/node
   ```

---

### "Out of Memory Error"

**Problem**: `JavaScript heap out of memory`

**Solutions**:

```bash
# Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build

# Or for Windows
set NODE_OPTIONS=--max-old-space-size=4096 && npm run build

# Or install more RAM (last resort)
```

---

## 🌐 Deployment Issues

### "Environment Variables Not Working on Vercel"

**Problem**: App works locally but fails when deployed

**Solutions**:

1. **Set Variables in Vercel Dashboard**
   - Project Settings → Environment Variables
   - Add all variables from .env.local
   - Redeploy

2. **Check Variable Names**
   - `NEXT_PUBLIC_*` prefix for client-side
   - Server-side vars don't need prefix
   - Exact spelling matters

3. **Rebuild After Adding Variables**
   ```bash
   # In Vercel dashboard
   Settings → Deployments → Redeploy
   ```

---

### "Build Timeout on Vercel"

**Problem**: Build exceeds 15 minute limit

**Solutions**:

1. **Optimize Dependencies**
   ```bash
   npm ls
   # Remove unused packages
   npm prune
   ```

2. **Build Locally First**
   ```bash
   npm run build
   # Verify it completes
   ```

3. **Request Higher Timeout**
   - Vercel Pro plan: Higher limits
   - Contact support

---

## 🐛 Common Runtime Errors

### "Cannot read property 'push' of undefined"

**Problem**: Router navigation error

**Solutions**:

1. **Check useRouter Hook**
   ```typescript
   'use client';  // Must be client component
   import { useRouter } from 'next/navigation';  // NOT 'next/router'
   
   export function MyComponent() {
     const router = useRouter();
     router.push('/');
   }
   ```

2. **Server Component Issue**
   - Add `'use client'` at top of file
   - Only client components can use useRouter

---

### "Hydration Mismatch Error"

**Problem**: `Warning: Text content did not match. Server: X Client: Y`

**Solutions**:

1. **Avoid Date/Time Without useEffect**
   ```typescript
   // ❌ Wrong
   export function MyComponent() {
     return <div>{new Date().toLocaleString()}</div>;
   }
   
   // ✅ Correct
   'use client';
   import { useEffect, useState } from 'react';
   
   export function MyComponent() {
     const [mounted, setMounted] = useState(false);
     
     useEffect(() => setMounted(true), []);
     
     if (!mounted) return null;
     return <div>{new Date().toLocaleString()}</div>;
   }
   ```

2. **Check Theme Consistency**
   - Ensure dark/light theme matches server
   - Use `suppressHydrationWarning`

---

## 📝 Logging & Debugging

### Enable Debug Logging

```typescript
// src/app/api/food/add-entry/route.ts
const DEBUG = process.env.DEBUG?.includes('nutriqo');

export async function POST(req: Request) {
  if (DEBUG) console.log('🔍 DEBUG: Request received', { body });
  
  // ... logic
  
  if (DEBUG) console.log('✅ DEBUG: Entry created', { id });
}
```

**Then run**:
```bash
DEBUG=nutriqo:* npm run dev
```

---

### View Browser Console Logs

1. Open DevTools: `F12`
2. Go to **Console** tab
3. Check for error messages
4. Clear and retry to see fresh events

---

## 🆘 Still Stuck?

1. **Check existing issues**: https://github.com/lRaxSonl/Nutriqo/issues
2. **Ask on GitHub Discussions**: https://github.com/lRaxSonl/Nutriqo/discussions
3. **Review logs thoroughly**: Most issues are in terminal/browser console
4. **Verify .env.local**: Most common issue!
5. **Try minimal reproduction**: Create simple test case

---

## 📞 Support Resources

| Issue Type | Resource |
|-----------|----------|
| General Questions | [GitHub Discussions](https://github.com/lRaxSonl/Nutriqo/discussions) |
| Bug Reports | [GitHub Issues](https://github.com/lRaxSonl/Nutriqo/issues) |
| Documentation | [README.md](./README.md) + [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Getting Started | [QUICKSTART.md](./QUICKSTART.md) |
| API Reference | [API_ENDPOINTS.md](./API_ENDPOINTS.md) |

---

**Last Updated**: March 26, 2026  
**If you found a solution not listed here, please share it!**
