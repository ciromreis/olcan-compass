# 🚀 Production Deployment Guide - Olcan Compass v2.5

**Complete step-by-step guide for deploying to production**

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### **Environment Setup**
- [ ] Production server provisioned
- [ ] Domain configured (olcan.com)
- [ ] SSL certificates obtained
- [ ] Database server ready
- [ ] CDN configured (optional)

### **Code Preparation**
- [ ] All tests passing
- [ ] Backend models fixed
- [ ] Environment variables configured
- [ ] Secrets secured
- [ ] Build verified locally

### **Monitoring & Analytics**
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (Google Analytics/Plausible)
- [ ] Uptime monitoring configured
- [ ] Performance monitoring configured

---

## 🔧 ENVIRONMENT CONFIGURATION

### **App Compass v2** (.env.production)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.olcan.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.olcan.com/ws

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication
NEXTAUTH_URL=https://app.olcan.com
NEXTAUTH_SECRET=your_nextauth_secret

# Feature Flags
NEXT_PUBLIC_ENABLE_COMPANION=true
NEXT_PUBLIC_ENABLE_MARKETPLACE=true
NEXT_PUBLIC_ENABLE_GUILDS=true

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Stripe (if using)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### **Site Marketing v2.5** (.env.production)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.olcan.com/api/v1

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Contact Form
NEXT_PUBLIC_CONTACT_EMAIL=contato@olcan.com
SENDGRID_API_KEY=your_sendgrid_key

# Feature Flags
NEXT_PUBLIC_ENABLE_BLOG=true
NEXT_PUBLIC_ENABLE_MARKETPLACE=true
```

### **Backend API** (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/olcan_prod

# Security
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=https://app.olcan.com,https://olcan.com

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
FROM_EMAIL=noreply@olcan.com

# External Services
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Environment
ENVIRONMENT=production
DEBUG=false
```

---

## 🏗️ DEPLOYMENT STEPS

### **Phase 1: Backend Deployment**

#### 1. Fix Database Models
```bash
cd apps/api-core-v2

# Follow BACKEND_MODEL_FIX_GUIDE.md
# Change User model ID to String
# Update relationships
```

#### 2. Set Up Production Database
```bash
# Create production database
createdb olcan_prod

# Run migrations
alembic upgrade head

# Verify database
psql olcan_prod -c "\dt"
```

#### 3. Deploy Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Run with Gunicorn
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8001 \
  --access-logfile - \
  --error-logfile - \
  --log-level info
```

#### 4. Configure Nginx (Reverse Proxy)
```nginx
server {
    listen 80;
    server_name api.olcan.com;
    
    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 5. Set Up SSL
```bash
# Using Certbot
sudo certbot --nginx -d api.olcan.com
```

---

### **Phase 2: Frontend Deployment (App)**

#### 1. Build Application
```bash
cd apps/app-compass-v2

# Install dependencies
npm install

# Build for production
npm run build

# Test production build locally
npm run start
```

#### 2. Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# vercel.com/your-project/settings/environment-variables
```

#### Alternative: Deploy to VPS
```bash
# Copy build to server
scp -r .next package.json package-lock.json user@server:/var/www/app

# On server
cd /var/www/app
npm install --production
npm run start

# Set up PM2
pm2 start npm --name "olcan-app" -- start
pm2 save
pm2 startup
```

---

### **Phase 3: Marketing Site Deployment**

#### 1. Build Site
```bash
cd apps/site-marketing-v2.5

# Install dependencies
npm install

# Build for production
npm run build

# Test production build
npm run start
```

#### 2. Deploy to Vercel
```bash
vercel --prod
```

#### Alternative: Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

---

### **Phase 4: Domain Configuration**

#### DNS Records
```
# Main site
olcan.com           A       your_server_ip
www.olcan.com       CNAME   olcan.com

# App subdomain
app.olcan.com       CNAME   cname.vercel-dns.com

# API subdomain
api.olcan.com       A       your_api_server_ip
```

---

## 🔍 POST-DEPLOYMENT VERIFICATION

### **Backend Health Checks**
```bash
# API health
curl https://api.olcan.com/docs

# Database connection
curl https://api.olcan.com/api/v1/health

# Authentication
curl -X POST https://api.olcan.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@olcan.com","password":"test"}'
```

### **Frontend Checks**
```bash
# App
curl -I https://app.olcan.com

# Marketing site
curl -I https://olcan.com

# Check SSL
curl -vI https://app.olcan.com 2>&1 | grep -i ssl
```

### **Performance Tests**
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --collect.url=https://app.olcan.com

# Load testing
npm install -g artillery
artillery quick --count 10 --num 50 https://api.olcan.com/api/v1/health
```

---

## 📊 MONITORING SETUP

### **Sentry (Error Tracking)**
```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs

# Configure in sentry.client.config.js
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 0.1,
});
```

### **Google Analytics**
```typescript
// Add to app/layout.tsx
import Script from 'next/script'

<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
  `}
</Script>
```

### **Uptime Monitoring**
- UptimeRobot: https://uptimerobot.com
- Pingdom: https://pingdom.com
- StatusCake: https://statuscake.com

Configure alerts for:
- API downtime
- App downtime
- Site downtime
- SSL expiration

---

## 🔐 SECURITY CHECKLIST

### **Before Going Live**
- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS enforced on all domains
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] SQL injection protection verified
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Security headers configured
- [ ] Database backups automated
- [ ] Error messages don't leak sensitive info

### **Security Headers** (Nginx)
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self' https:;" always;
```

---

## 🔄 CI/CD SETUP (Optional)

### **GitHub Actions** (.github/workflows/deploy.yml)
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-app:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: cd apps/app-compass-v2 && npm install
      
      - name: Build
        run: cd apps/app-compass-v2 && npm run build
      
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 📈 PERFORMANCE OPTIMIZATION

### **CDN Configuration**
- Use Cloudflare or AWS CloudFront
- Cache static assets (images, CSS, JS)
- Enable Brotli compression
- Configure cache headers

### **Database Optimization**
```sql
-- Add indexes for common queries
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_companion_user ON companions(user_id);
CREATE INDEX idx_created_at ON companions(created_at);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM companions WHERE user_id = 'xxx';
```

### **Image Optimization**
```bash
# Install sharp (already in package.json)
npm install sharp

# Next.js automatically optimizes images
# Use <Image> component from next/image
```

---

## 🚨 ROLLBACK PLAN

### **If Deployment Fails**

#### Backend Rollback
```bash
# Revert to previous version
git revert HEAD
git push

# Redeploy
pm2 restart olcan-api
```

#### Frontend Rollback
```bash
# Vercel - use dashboard to rollback
# Or redeploy previous version
vercel --prod --force
```

#### Database Rollback
```bash
# Revert migration
alembic downgrade -1

# Restore from backup
pg_restore -d olcan_prod backup.sql
```

---

## 📞 SUPPORT & TROUBLESHOOTING

### **Common Issues**

#### 1. CORS Errors
```python
# Check backend CORS settings
ALLOWED_ORIGINS = [
    "https://app.olcan.com",
    "https://olcan.com"
]
```

#### 2. Database Connection Issues
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

#### 3. Build Failures
```bash
# Clear cache
rm -rf .next
npm run build

# Check Node version
node --version  # Should be 20+
```

---

## ✅ FINAL CHECKLIST

### **Before Launch**
- [ ] All environment variables set
- [ ] SSL certificates installed
- [ ] DNS records configured
- [ ] Database migrations run
- [ ] Backend health check passing
- [ ] Frontend loading correctly
- [ ] Authentication working
- [ ] Payment processing tested (if applicable)
- [ ] Email sending working
- [ ] Monitoring configured
- [ ] Backups automated
- [ ] Team notified

### **After Launch**
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify analytics tracking
- [ ] Test critical user flows
- [ ] Monitor server resources
- [ ] Check logs for issues
- [ ] Verify backup completion
- [ ] Update documentation

---

## 🎉 LAUNCH DAY PROTOCOL

### **T-24 Hours**
- Final code freeze
- Run full test suite
- Verify all credentials
- Brief team on launch plan

### **T-1 Hour**
- Final backup
- Verify monitoring
- Team on standby

### **Launch**
- Deploy backend
- Deploy frontend
- Verify health checks
- Monitor for 1 hour

### **T+1 Hour**
- Check error rates
- Verify user flows
- Monitor performance
- Send launch announcement

---

**Timeline**: 6-8 hours for complete deployment  
**Team Required**: 2-3 people (backend, frontend, DevOps)  
**Recommended Time**: Off-peak hours (e.g., Sunday 2 AM)

🚀 **Ready to deploy!**
