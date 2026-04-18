# Vercel Deployment Fix - Marketing Site

**Date:** April 6, 2026  
**Issue:** Deployment shows errors / renders differently  
**Root Cause:** Missing environment variables in Vercel  
**Status:** ✅ Build successful, needs environment configuration

---

## 🔍 Issue Analysis

### What I Found
1. ✅ **Build is successful** - Local build works perfectly
2. ✅ **Deployment is live** - Site is deployed and accessible
3. ❌ **No environment variables set** - Vercel has 0 env vars configured
4. ⚠️ **Payload CMS won't work** - Needs DATABASE_URI, PAYLOAD_SECRET, JWT_SECRET

### Why It Looks Different
The old deployment (4 days ago) was from before the consolidation changes. The new deployment includes:
- Payload CMS integration (needs database)
- Enhanced components (CEO page, globe, etc.)
- Security headers
- Static fallback products

**Without environment variables, some features won't work properly.**

---

## 🔧 Quick Fix - Set Environment Variables in Vercel Dashboard

### Step 1: Go to Vercel Dashboard
```
https://vercel.com/dashboard
→ Select "site-marketing-v25" project
→ Go to "Settings" tab
→ Click "Environment Variables" in sidebar
```

### Step 2: Add These Essential Variables

Click "Add New" for each variable:

#### Required for Site to Work
```bash
Name: NEXT_PUBLIC_SITE_URL
Value: https://www.olcan.com.br
Environments: ✓ Production ✓ Preview ✓ Development
```

```bash
Name: NEXT_PUBLIC_API_URL
Value: https://api.olcan.com.br/api/v1
Environments: ✓ Production ✓ Preview ✓ Development
```

```bash
Name: NEXT_PUBLIC_MARKETPLACE_API_URL
Value: https://marketplace.olcan.com.br
Environments: ✓ Production ✓ Preview ✓ Development
```

```bash
Name: NEXT_PUBLIC_MEDUSA_URL
Value: http://localhost:9000
Environments: ✓ Production ✓ Preview ✓ Development
```

```bash
Name: EMAIL_FROM
Value: contato@olcan.com.br
Environments: ✓ Production ✓ Preview ✓ Development
```

### Step 3: Add Payload CMS Variables (Optional - for Admin Panel)

**⚠️ Only add these if you want the `/admin` panel to work:**

```bash
Name: PAYLOAD_SECRET
Value: [Generate a secure 32+ character secret]
Environments: ✓ Production ✓ Preview ✓ Development
```

```bash
Name: JWT_SECRET
Value: [Use the same secret as PAYLOAD_SECRET]
Environments: ✓ Production ✓ Preview ✓ Development
```

```bash
Name: DATABASE_URI
Value: postgresql://user:password@host:5432/database?schema=payload
Environments: ✓ Production ✓ Preview ✓ Development
```

**Note:** For DATABASE_URI, you need a PostgreSQL database. Options:
- **Neon** (free tier): https://neon.tech
- **Supabase** (free tier): https://supabase.com
- **Railway**: https://railway.app

### Step 4: Redeploy
After adding variables, click "Redeploy" button in Vercel dashboard or:
```bash
cd apps/site-marketing-v2.5
vercel --prod
```

---

## 📊 Deployment Comparison

### Old Deployment (4 days ago)
- **Commit:** Before consolidation
- **Features:** Basic marketing site
- **Status:** Working but outdated

### New Deployment (Today)
- **Commit:** `feat(marketing-site): update for Vercel deployment...`
- **Features:** 
  - ✅ Payload CMS integration
  - ✅ Static fallback products
  - ✅ Security headers
  - ✅ CEO page enhancements
  - ✅ Enhanced components
- **Status:** Deployed but needs env vars

---

## 🎯 What's Different in the New Version

### Added Features
1. **Payload CMS** - Admin panel at `/admin` (needs database)
2. **Static Fallbacks** - Products display even without API
3. **Security Headers** - CSP, HSTS, X-Frame-Options
4. **CEO Page** - Complete redesign with timeline
5. **Enhanced Globe** - Better 3D visualization
6. **Mercur Client** - Product fetching with fallbacks

### Why It Might Look Different
- **Missing env vars** → Some dynamic content won't load
- **Payload CMS routes** → New `/admin` and `/api` routes added
- **Enhanced styling** → Updated components and layouts

---

## ✅ Verification Steps

After setting environment variables and redeploying:

### 1. Check Homepage
```
URL: https://site-marketing-v25.vercel.app
Expected: Hero, products, blog sections load
```

### 2. Check Products
```
URL: https://site-marketing-v25.vercel.app/marketplace
Expected: 3 static fallback products display
```

### 3. Check CEO Page
```
URL: https://site-marketing-v25.vercel.app/sobre/ceo
Expected: Complete page with hero, timeline, methodology
```

### 4. Check Security Headers
```
Tool: https://securityheaders.com
URL: https://site-marketing-v25.vercel.app
Expected: A or A+ rating
```

### 5. Check Admin Panel (if database configured)
```
URL: https://site-marketing-v25.vercel.app/admin
Expected: Payload CMS login page
```

---

## 🚨 Common Issues

### Issue: "Page renders blank"
**Cause:** Missing NEXT_PUBLIC_SITE_URL  
**Fix:** Add environment variable in Vercel dashboard

### Issue: "Products don't show"
**Cause:** This is expected! Static fallbacks should display  
**Fix:** Verify 3 products appear (Cidadão do Mundo, Kit, Rota)

### Issue: "/admin returns 500 error"
**Cause:** Missing DATABASE_URI or invalid connection string  
**Fix:** Set up PostgreSQL database and add DATABASE_URI

### Issue: "Build fails after adding env vars"
**Cause:** Invalid environment variable value  
**Fix:** Check for typos, ensure no trailing spaces

---

## 📝 Environment Variables Checklist

### Essential (Required)
- [ ] NEXT_PUBLIC_SITE_URL
- [ ] NEXT_PUBLIC_API_URL
- [ ] NEXT_PUBLIC_MARKETPLACE_API_URL
- [ ] NEXT_PUBLIC_MEDUSA_URL
- [ ] EMAIL_FROM

### Optional (For Admin Panel)
- [ ] PAYLOAD_SECRET
- [ ] JWT_SECRET
- [ ] DATABASE_URI

### Optional (Analytics)
- [ ] NEXT_PUBLIC_GA_ID
- [ ] NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
- [ ] NEXT_PUBLIC_META_PIXEL_ID

---

## 🔗 Quick Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Project Settings:** https://vercel.com/dashboard/site-marketing-v25/settings
- **Environment Variables:** https://vercel.com/dashboard/site-marketing-v25/settings/environment-variables
- **Deployments:** https://vercel.com/dashboard/site-marketing-v25/deployments

---

## 💡 Recommendation

**For now (quick fix):**
1. Add the 5 essential environment variables
2. Redeploy
3. Test the site

**For full functionality (later):**
1. Set up PostgreSQL database (Neon/Supabase)
2. Add Payload CMS environment variables
3. Access `/admin` to create content
4. Add analytics tracking codes

---

**Status:** Ready to configure ✅  
**Next Action:** Add environment variables in Vercel dashboard  
**Expected Time:** 5 minutes to add vars + 2 minutes for redeploy
