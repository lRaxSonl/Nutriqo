# Security Policy

## Reporting Security Issues

If you discover a security vulnerability in **Nutriqo**, please report it responsibly.

### Do NOT

❌ Do not create a public GitHub issue  
❌ Do not post on social media  
❌ Do not share details before a fix is released  

### Do

✅ Email security details directly to maintainers  
✅ Include vulnerability description and proof-of-concept  
✅ Allow 30 days for fix development and release  
✅ Follow responsible disclosure practices  

## Supported Versions

| Version | Status | Support |
|---------|--------|---------|
| 0.1.0 | Current | ✅ Active |
| < 0.1.0 | Legacy | ⛔ Unsupported |

Only the latest version receives security updates.

## Security Considerations

### Authentication & Authorization

- ✅ **JWT Tokens**: Cryptographically signed, 24-hour expiration
- ✅ **NextAuth.js**: Industry-standard, CSRF-protected
- ✅ **Role-Based Access**: User/Admin roles with permission checks
- ✅ **Password Security**: Hashed by PocketBase with bcrypt
- ✅ **Session Management**: HTTP-only, secure cookies

### Data Protection

- ✅ **Encryption Transit**: HTTPS required in production
- ✅ **Data Storage**: PocketBase with built-in encryption
- ✅ **Secrets Management**: Environment variables, never in code
- ✅ **API Keys**: Kept server-side, never exposed to client

### API Security

- ✅ **Input Validation**: All endpoints validate input
- ✅ **Rate Limiting**: 100 requests/minute per user
- ✅ **CORS**: Properly configured origins only
- ✅ **Error Handling**: No sensitive data in error messages

### Dependency Security

- ✅ **Minimal Dependencies**: Only necessary packages
- ✅ **Regular Updates**: `npm audit` checked regularly
- ✅ **Vulnerability Scanning**: GitHub security alerts enabled
- ✅ **Lock File**: package-lock.json committed for reproducibility

### Code Security

- ✅ **TypeScript Strict Mode**: Type safety enabled
- ✅ **ESLint**: Code quality and security rules
- ✅ **Input Sanitization**: XSS protection
- ✅ **No Hardcoded Secrets**: All credentials externalized

## Known Limitations

### Current Version (0.1.0)

- ⚠️ **No 2FA**: Two-factor authentication not yet implemented
- ⚠️ **No Audit Logs**: Admin actions not yet logged
- ⚠️ **No API Rate Limiting on Webhooks**: Stripe webhooks unrestricted
- ⚠️ **No Request Signing**: Future feature for webhook verification
- ⚠️ **Development Mode**: Default demo credentials visible

### Recommendations

1. **Use Strong Passwords**: Min 12 characters, mixed case, numbers, symbols
2. **Enable HTTPS**: Never expose PocketBase without TLS
3. **Regular Backups**: PocketBase data backup recommended
4. **Monitor Logs**: Central logging for security events
5. **Dependency Updates**: Keep packages current

## Production Security Checklist

Before deploying to production:

- [ ] **Environment Variables**: All secrets in secure vault
- [ ] **HTTPS Enabled**: TLS certificate installed
- [ ] **Admin Accounts**: Strong passwords set
- [ ] **CORS Configuration**: Only trusted origins allowed
- [ ] **Backup Strategy**: Regular backups configured
- [ ] **Monitoring**: Error tracking and logging enabled
- [ ] **Dependencies**: `npm audit` shows zero vulnerabilities
- [ ] **API Keys**: All development keys replaced with production keys
- [ ] **Database**: PocketBase backed up and off-site
- [ ] **Secrets Rotation**: Plan for regular key rotation

## Deployment Security

### Vercel

- ✅ Built-in HTTPS and DDoS protection
- ✅ Environment variable encryption
- ✅ Automatic security headers
- ✅ Preview URLs password protected

**Configuration**:
```
Settings → Security → Production Deployment Protection: ON
```

### Docker

- ✅ Use non-root user in container
- ✅ Mount secrets as Docker secrets
- ✅ Keep image layers minimal
- ✅ Scan images for vulnerabilities

**Example**:
```dockerfile
FROM node:18-alpine
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
USER nextjs

EXPOSE 3000
CMD ["npm", "start"]
```

### Self-Hosted PocketBase

- ✅ Firewall: Only necessary ports open
- ✅ Updates: Regular PocketBase updates
- ✅ Backups: Automated daily backups
- ✅ Monitoring: Health checks and alerting
- ✅ SSL: Let's Encrypt certificate

## Third-Party Security

### Stripe Integration

- ✅ PCI-DSS Compliance: Stripe handles payment data
- ✅ Webhooks Signed: Verify webhook signatures
- ✅ Never Store Cards: Use Stripe checkout only

**Webhook Verification**:
```typescript
// src/app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') || '';
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    // Handle event
  } catch (err) {
    return new Response('Webhook Error', { status: 400 });
  }
}
```

### OpenAI Integration

- ✅ API Key Rotation: Change keys regularly
- ✅ Usage Limits: Set account spending limits
- ✅ Audit Logs: Monitor API usage in OpenAI dashboard

**Best Practices**:
```typescript
// Check subscription before API call
if (session.user.subscriptionStatus !== 'active') {
  return 403; // Forbidden
}

// Log API usage
console.log(`Photo analysis for user ${userId}`);
```

### Google OAuth

- ✅ Credentials Management: Rotate credentials annually
- ✅ Scopes Limited: Request only needed permissions
- ✅ Tokens Revoked: Logout clears tokens

## Incident Response

### If Security Attack Detected

1. **Immediate Actions**:
   - Revoke all active tokens
   - Force password resets
   - Take affected systems offline

2. **Investigation**:
   - Review audit logs
   - Identify attack vector
   - Check for data exfiltration

3. **Remediation**:
   - Deploy fix
   - Update security groups
   - Communicate with users

4. **Communication**:
   - Notify affected users
   - Post security advisory
   - Share findings (when appropriate)

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Stripe Security](https://stripe.com/docs/security)
- [OIDC Security](https://openid.net/specs/openid-connect-core-1_0.html)

## Version History

### v0.1.0 (March 26, 2026)
- Initial security-hardened release
- JWT authentication implemented
- Role-based access control
- Input validation on all endpoints
- HTTPS-ready architecture

---

**Last Updated**: March 26, 2026  
**Maintained By**: Security Team  
**Contact**: [Create Issue](https://github.com/lRaxSonl/Nutriqo/security/advisories)

For security updates, watch the repository: ⭐ Star on GitHub
