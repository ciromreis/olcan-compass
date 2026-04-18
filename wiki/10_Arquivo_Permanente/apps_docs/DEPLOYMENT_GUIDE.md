# Olcan Compass v2.5 - Deployment Guide

## 🚀 Quick Start

This guide covers deploying Olcan Compass v2.5 to various platforms.

## ✅ Pre-Deployment Checklist

### 1. Build Verification
```bash
npm run build
# ✅ Should complete without errors
# ✅ 138 pages should compile successfully
```

### 2. Environment Variables
Copy the appropriate example file and fill in your values:
```bash
# For production
cp .env.production.example .env.production

# For local development
cp .env.example .env.local
```

### 3. Required Environment Variables

**Critical (Must Set):**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_APP_URL` - Frontend app URL
- `NEXT_PUBLIC_DEMO_MODE` - Set to `false` for production

**Authentication (if using Supabase):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Payments (if using Stripe):**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`

**Optional but Recommended:**
- `NEXT_PUBLIC_APP_VERSION` - For tracking deployments
- `NEXT_PUBLIC_ENABLE_ANALYTICS` - Enable/disable analytics

## 📦 Platform-Specific Deployment

### Vercel (Recommended)

**1. Install Vercel CLI:**
```bash
npm install -g vercel
```

**2. Deploy:**
```bash
vercel --prod
```

**3. Configuration:**
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install --legacy-peer-deps`

**Environment Variables:**
Set in Vercel Dashboard → Settings → Environment Variables

**vercel.json is already configured** ✅

### Docker

**1. Build Image:**
```bash
docker build -f Dockerfile.prod -t olcan-compass:2.5.0 .
```

**2. Run Container:**
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.olcan.com \
  -e NEXT_PUBLIC_DEMO_MODE=false \
  olcan-compass:2.5.0
```

**3. Docker Compose:**
```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NEXT_PUBLIC_DEMO_MODE=false
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**Dockerfile.prod is already configured** ✅

### Railway

**1. Install Railway CLI:**
```bash
npm install -g @railway/cli
```

**2. Deploy:**
```bash
railway up
```

**Configuration:**
- Railway will auto-detect Next.js
- Uses `railway.json` for build configuration

**railway.json is already configured** ✅

### Render

**1. Connect Repository:**
- Go to Render Dashboard
- New → Web Service
- Connect your Git repository

**2. Configuration:**
- Build Command: `npm install --legacy-peer-deps && npm run build`
- Start Command: `npm start`
- Environment: Node

**render.yaml is already configured** ✅

### Netlify

**1. Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

**2. Deploy:**
```bash
netlify deploy --prod
```

**Configuration:**
- Build Command: `npm run build`
- Publish Directory: `.next`
- Functions Directory: `.netlify/functions`

**netlify.toml is already configured** ✅

### AWS (EC2, ECS, or Elastic Beanstalk)

**Using Docker on EC2:**
```bash
# 1. SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance

# 2. Install Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start

# 3. Pull and run your image
docker pull your-registry/olcan-compass:2.5.0
docker run -d -p 80:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.olcan.com \
  your-registry/olcan-compass:2.5.0
```

**Using ECS:**
- Create task definition using Dockerfile.prod
- Configure service with load balancer
- Set environment variables in task definition

### Kubernetes

**1. Create Deployment:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: olcan-compass
spec:
  replicas: 3
  selector:
    matchLabels:
      app: olcan-compass
  template:
    metadata:
      labels:
        app: olcan-compass
    spec:
      containers:
      - name: app
        image: your-registry/olcan-compass:2.5.0
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.olcan.com"
        - name: NODE_ENV
          value: "production"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: olcan-compass
spec:
  selector:
    app: olcan-compass
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

**2. Apply:**
```bash
kubectl apply -f k8s-deployment.yaml
```

## 🔍 Health Checks

The application provides two health check endpoints:

### Health Check
```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-15T10:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "2.5.0",
  "service": "olcan-compass-v2.5"
}
```

### Readiness Check
```bash
curl http://localhost:3000/api/ready
```

**Response:**
```json
{
  "status": "ready",
  "timestamp": "2026-04-15T10:00:00.000Z",
  "checks": {
    "server": "ok"
  }
}
```

## 🔒 Security Considerations

### 1. Environment Variables
- ✅ Never commit `.env.local` or `.env.production` to Git
- ✅ Use secrets management (AWS Secrets Manager, Vault, etc.)
- ✅ Rotate API keys regularly

### 2. HTTPS
- ✅ Always use HTTPS in production
- ✅ Configure SSL/TLS certificates
- ✅ Enable HSTS (already configured in next.config.mjs)

### 3. Security Headers
Already configured in `next.config.mjs`:
- ✅ Strict-Transport-Security
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ Referrer-Policy
- ✅ Permissions-Policy

### 4. CORS
Configure allowed origins in your environment:
```env
ALLOWED_ORIGINS=https://olcan.com,https://www.olcan.com
```

### 5. Rate Limiting
Consider adding rate limiting middleware for API routes:
- Use Vercel's built-in rate limiting
- Or implement custom middleware with Redis

## 📊 Monitoring & Logging

### Recommended Tools

**Application Monitoring:**
- Vercel Analytics (if using Vercel)
- Sentry for error tracking
- New Relic or Datadog for APM

**Logging:**
- Vercel Logs (if using Vercel)
- CloudWatch (if using AWS)
- Papertrail or Loggly

**Uptime Monitoring:**
- UptimeRobot
- Pingdom
- StatusCake

### Setting Up Sentry

1. Install Sentry:
```bash
npm install @sentry/nextjs
```

2. Add to environment:
```env
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project
```

3. Initialize in `src/app/layout.tsx`

## 🚦 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm install --legacy-peer-deps
        
      - name: Run tests
        run: npm run test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 🔄 Rollback Strategy

### Vercel
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Docker
```bash
# Keep previous image tagged
docker tag olcan-compass:2.5.0 olcan-compass:2.5.0-backup

# Rollback
docker stop olcan-compass
docker run -d olcan-compass:2.4.0
```

### Kubernetes
```bash
# Rollback to previous revision
kubectl rollout undo deployment/olcan-compass

# Rollback to specific revision
kubectl rollout undo deployment/olcan-compass --to-revision=2
```

## 📈 Performance Optimization

### 1. Enable Caching
```nginx
# Nginx example
location /_next/static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. CDN Configuration
- Use Vercel's Edge Network (automatic)
- Or configure CloudFront/Cloudflare

### 3. Image Optimization
- Next.js Image component is already used
- Configure image domains in next.config.mjs if needed

### 4. Database Connection Pooling
- Use connection pooling for database queries
- Configure in your backend API

## 🧪 Testing Before Deployment

### 1. Local Production Build
```bash
npm run build
npm start
```

### 2. Run E2E Tests
```bash
npm run test
```

### 3. Check Bundle Size
```bash
npm run build
# Check .next/analyze output
```

### 4. Lighthouse Audit
```bash
npx lighthouse http://localhost:3000 --view
```

## 📝 Post-Deployment Checklist

- [ ] Verify health check endpoint: `/api/health`
- [ ] Verify readiness endpoint: `/api/ready`
- [ ] Test critical user flows
- [ ] Check error tracking (Sentry)
- [ ] Verify analytics are working
- [ ] Test payment flows (if applicable)
- [ ] Check mobile responsiveness
- [ ] Verify SSL certificate
- [ ] Test CORS configuration
- [ ] Monitor logs for errors
- [ ] Set up uptime monitoring
- [ ] Document deployment in changelog

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
```

### Environment Variables Not Working
- Check variable names (must start with `NEXT_PUBLIC_` for client-side)
- Restart dev server after changing .env files
- Verify variables are set in deployment platform

### 500 Errors in Production
- Check server logs
- Verify all environment variables are set
- Check API connectivity
- Review Sentry error reports

### Slow Performance
- Enable caching
- Use CDN
- Optimize images
- Check database query performance
- Review bundle size

## 📞 Support

For deployment issues:
1. Check this guide first
2. Review platform-specific documentation
3. Check application logs
4. Contact DevOps team

---

**Last Updated:** April 15, 2026  
**Version:** 2.5.0  
**Maintained by:** Olcan Development Team
