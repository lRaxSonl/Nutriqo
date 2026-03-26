# Deployment Guide

Complete guide for deploying **Nutriqo** to production environments.

## 📋 Pre-Deployment Checklist

- [ ] All tests passing: `npm test`
- [ ] No ESLint errors: `npm run lint`
- [ ] Build successful locally: `npm run build`
- [ ] Environment variables documented
- [ ] Database backups configured
- [ ] Monitoring set up
- [ ] Security checklist complete (see [SECURITY.md](./SECURITY.md))
- [ ] API keys generated and validated
- [ ] SSL certificates ready
- [ ] Domain name configured
- [ ] Analytics configured
- [ ] Error tracking enabled

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

**Best for**: Quick deployment, automatic scaling, built-in security

#### Step 1: Connect Repository

1. Go to [Vercel](https://vercel.com/)
2. Sign in with GitHub
3. Click "Import Project"
4. Select `lRaxSonl/Nutriqo` repository
5. Choose "Root Directory": `nutriqo-app`

#### Step 2: Configure Environment

In Vercel Dashboard:

1. Settings → Environment Variables
2. Add all production variables:

```env
# Database
POCKETBASE_URL=https://pb.your-domain.com
POCKETBASE_ADMIN_EMAIL=admin@nutriqo.app
POCKETBASE_ADMIN_PASSWORD=<strong_password>

# NextAuth
NEXTAUTH_URL=https://nutriqo.app
NEXTAUTH_SECRET=<generate: openssl rand -base64 32>

# OAuth
GOOGLE_CLIENT_ID=<your_google_id>
GOOGLE_CLIENT_SECRET=<your_google_secret>

# Payments
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI
OPENAI_API_KEY=sk-proj-...
```

#### Step 3: Deploy

1. Click "Deploy"
2. Wait for build (5-10 minutes)
3. Vercel provides URL: `https://nutriqo.vercel.app`

#### Step 4: Configure Domain

1. Settings → Domains
2. Add custom domain: `nutriqo.app`
3. Follow DNS configuration
4. SSL automatically configured

#### Step 5: Webhook Configuration

For Stripe payments:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://nutriqo.app/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`
4. Copy webhook secret to Vercel environment

### Option 2: Docker + Self-Hosted

**Best for**: Full control, custom infrastructure

#### Step 1: Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
```

#### Step 2: Build Image

```bash
docker build -t nutriqo:0.1.0 .
docker tag nutriqo:0.1.0 your-registry/nutriqo:latest
```

#### Step 3: Push to Registry

```bash
docker push your-registry/nutriqo:latest
```

#### Step 4: Deploy with Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    image: your-registry/nutriqo:latest
    ports:
      - "3000:3000"
    environment:
      NEXTAUTH_URL: https://nutriqo.app
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      POCKETBASE_URL: http://pocketbase:8090
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    depends_on:
      - pocketbase
    restart: unless-stopped

  pocketbase:
    image: ghcr.io/pocketbase/pocketbase:latest
    ports:
      - "8090:8090"
    volumes:
      - pb_data:/pb_data
    environment:
      PB_ADMIN_EMAIL: ${POCKETBASE_ADMIN_EMAIL}
      PB_ADMIN_PASSWORD: ${POCKETBASE_ADMIN_PASSWORD}
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  pb_data:
```

#### Step 5: Configure Nginx

```nginx
# nginx.conf
events {
  worker_connections 1024;
}

http {
  upstream app {
    server app:3000;
  }

  server {
    listen 443 ssl http2;
    server_name nutriqo.app;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
      proxy_pass http://app;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
  }

  server {
    listen 80;
    server_name nutriqo.app;
    return 301 https://$server_name$request_uri;
  }
}
```

#### Step 6: Start Services

```bash
docker-compose up -d
```

### Option 3: AWS EC2 + RDS

**Best for**: Enterprise deployments, high traffic

#### Step 1: Launch EC2 Instance

```bash
# Prerequisites
- Ubuntu 22.04 LTS
- t3.small minimum
- 20GB EBS storage
- Security group allows SSH (22), HTTP (80), HTTPS (443)

# Connect
ssh -i key.pem ubuntu@your-instance-ip
```

#### Step 2: Setup Environment

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install SSL certificate
sudo apt install -y certbot python3-certbot-nginx
```

#### Step 3: Clone & Deploy

```bash
# Clone repo
git clone https://github.com/lRaxSonl/Nutriqo.git
cd Nutriqo/nutriqo-app

# Install dependencies
npm install --production

# Build
npm run build

# Create .env.production
nano .env.local

# Start with PM2
pm2 start npm --name "nutriqo" -- start
pm2 startup
pm2 save
```

#### Step 4: Configure Nginx

```bash
sudo tee /etc/nginx/sites-available/nutriqo >/dev/null <<EOF
server {
    listen 80;
    server_name nutriqo.app;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/nutriqo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Enable SSL

```bash
sudo certbot --nginx -d nutriqo.app
```

## 📊 Monitoring & Maintenance

### Setup Error Tracking

**Option A: Sentry**

```javascript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

**Option B: LogRocket**

```javascript
import LogRocket from 'logrocket';

LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_ID);
```

### Database Backups

**PocketBase Backup Script**:

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/pocketbase"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup PocketBase data
tar -czf $BACKUP_DIR/pb_backup_$DATE.tar.gz /pb_data

# Keep only last 7 backups
ls -t1 $BACKUP_DIR/pb_backup_*.tar.gz | tail -n +8 | xargs -r rm
```

**Schedule with Cron**:

```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### Monitoring Checklist

- [ ] Server health endpoints
- [ ] Database connection status
- [ ] API response times (< 200ms)
- [ ] Error rate (< 1%)
- [ ] Resource usage (CPU, Memory, Disk)
- [ ] Payment webhook success rate

## 🔐 Production Security Hardening

### Environment-Specific Settings

```env
# Production Only
NODE_ENV=production
NEXTAUTH_URL=https://nutriqo.app

# Strict headers
STRICT_TRANSPORT_SECURITY=max-age=31536000; includeSubDomains
X_CONTENT_TYPE_OPTIONS=nosniff
X_FRAME_OPTIONS=DENY
```

### Nginx Security Headers

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

### Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;

location /api/ {
  limit_req zone=api_limit burst=20 nodelay;
  proxy_pass http://app;
}
```

## 📈 Scaling Strategy

### Vertical Scaling
- Upgrade instance type (t3.small → t3.medium)
- Increase database resources
- Add memory/CPU to server

### Horizontal Scaling
- Use load balancer (AWS ALB, Nginx)
- Multiple app instances
- PocketBase read replicas (future)

### Caching Strategy
- Cloudflare CDN for static assets
- Redis for session caching
- HTTP caching headers on API

## 🚨 Disaster Recovery

### Backup Strategy

1. **Database Backups**
   - Daily snapshots to S3
   - 30-day retention
   - Test restore monthly

2. **Code Backups**
   - GitHub is primary backup
   - Tag releases
   - Document deployment

3. **Configuration Backups**
   - Store .env.production in vault
   - Document all settings
   - Version control where possible

### Recovery Procedures

**If Database Corrupted**:
1. Stop application
2. Restore from latest backup
3. Verify data integrity
4. Restart application

**If Application Server Down**:
1. Launch new instance from AMI
2. Attach elastic IP
3. Update DNS (if needed)
4. Verify health checks

## 📞 Post-Deployment

### Verification Checklist

- [ ] Landing page loads
- [ ] User registration works
- [ ] Email notifications send (if enabled)
- [ ] OAuth (Google) login works
- [ ] Food entry creation works
- [ ] Photo analysis works (with real key)
- [ ] Stripe payment flow completes
- [ ] Admin panel accessible
- [ ] Database queries performant
- [ ] API response times acceptable
- [ ] SSL certificate valid
- [ ] Mobile responsive

### Performance Testing

```bash
# Load test with Apache Bench
ab -n 1000 -c 100 https://nutriqo.app/

# Or Vegeta
echo "GET https://nutriqo.app/" | vegeta attack -duration=60s | vegeta report
```

### Document Everything

- [ ] Deployment date and time
- [ ] Version deployed
- [ ] Environment variables used
- [ ] Database backup location
- [ ] Monitoring dashboard URLs
- [ ] Escalation contacts
- [ ] Rollback procedure

## 🔄 Continuous Deployment

### GitHub Actions Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Run Tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 📊 Cost Estimation

### Monthly Costs (Approximate)

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Pro | $20 |
| PocketBase | Self-hosted | $5-20 (compute) |
| Stripe | 2.9% + $0.30 per transaction | Variable |
| OpenAI | API usage | ~$50-200 |
| Domain + DNS | | $12 |
| **Total** | | **~$87-252+** |

## 🎯 Next Steps After Deployment

1. **Monitor Performance**: Track metrics daily
2. **Gather Feedback**: Ask users for feedback
3. **Plan Features**: Track feature requests
4. **Address Issues**: Fix bugs promptly
5. **Scale When Needed**: Add resources as traffic grows

---

**Last Updated**: March 26, 2026  
**Maintained By**: DevOps Team  

For questions, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) or create a GitHub issue.
