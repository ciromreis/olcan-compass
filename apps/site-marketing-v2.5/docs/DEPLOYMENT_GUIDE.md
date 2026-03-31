# 🚀 Olcan Website - Deployment Guide
## Production Deployment with Mautic Integration

**Version**: Olcan Compass v2.5  
**Date**: March 27, 2026  
**Status**: Ready for Production

---

## 📋 Pre-Deployment Checklist

### 1. Environment Setup

Create `.env.local` file in `/apps/site-marketing-v2.5/`:

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google Site Verification (for Search Console)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code-here

# Mautic Marketing Automation
NEXT_PUBLIC_MAUTIC_URL=https://mautic.olcan.com.br
NEXT_PUBLIC_MAUTIC_KEY=your-mautic-api-key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://www.olcan.com.br

# Email Service (optional - for contact forms)
EMAIL_SERVICE_API_KEY=your-email-service-key
EMAIL_FROM=contato@olcan.com.br
```

### 2. Google Analytics Setup

**Step 1: Create GA4 Property**
1. Go to https://analytics.google.com
2. Create new property "Olcan Website"
3. Set up data stream for www.olcan.com.br
4. Copy Measurement ID (G-XXXXXXXXXX)
5. Add to `.env.local` as `NEXT_PUBLIC_GA_ID`

**Step 2: Configure Events**
The following events are automatically tracked:
- `page_view` - All page views
- `scroll_depth` - 25%, 50%, 75%, 100%
- `newsletter_signup` - Email collection
- `resource_download` - Lead magnets
- `product_view` - Product pages
- `consultation_request` - Contact forms
- `purchase` - Transactions

**Step 3: Set Up Conversions**
In GA4, mark these as conversion events:
- `newsletter_signup`
- `consultation_request`
- `purchase`
- `enrollment_complete`

### 3. Mautic Setup

**Step 1: Install Mautic**

Option A: Self-Hosted (Recommended)
```bash
# Using Docker
docker run -d \
  --name mautic \
  -p 8080:80 \
  -e MAUTIC_DB_HOST=db \
  -e MAUTIC_DB_USER=mautic \
  -e MAUTIC_DB_PASSWORD=your-password \
  -e MAUTIC_DB_NAME=mautic \
  mautic/mautic:latest
```

Option B: Managed Hosting
- Use Mautic Cloud: https://www.mautic.com/
- Or hosting providers like Cloudways, DigitalOcean

**Step 2: Configure Mautic**

1. **Access Mautic**: https://mautic.olcan.com.br
2. **Complete Setup Wizard**
3. **Create API Credentials**:
   - Go to Settings → API Settings
   - Enable API
   - Create OAuth2 credentials
   - Copy API key to `.env.local`

**Step 3: Create Forms in Mautic**

Create these forms:
1. **Newsletter Signup** (ID: newsletter)
2. **Resource Download** (ID: resource-download)
3. **Consultation Request** (ID: consultation)
4. **Course Enrollment** (ID: enrollment)

**Step 4: Set Up Campaigns**

Create automated campaigns:

**Welcome Sequence**:
```
Trigger: Contact subscribes to newsletter
├── Send: Welcome email (immediate)
├── Wait: 2 days
├── Send: Curso Cidadão do Mundo intro
├── Wait: 3 days
├── Send: Success story
├── Wait: 2 days
└── Send: Limited offer (10% discount)
```

**Product Interest**:
```
Trigger: Contact visits product page
├── Send: Product overview (1 hour)
├── Wait: 1 day
├── Send: Features + Benefits
├── Wait: 2 days
├── Send: Testimonials
├── Wait: 2 days
└── Send: Special offer
```

**Abandoned Cart**:
```
Trigger: Checkout started, not completed
├── Send: Reminder (1 hour)
├── Wait: 23 hours
├── Send: Incentive (5% discount)
├── Wait: 2 days
└── Send: Final reminder
```

**Step 5: Configure Lead Scoring**

In Mautic Settings → Points:
- Email Signup: +5
- Resource Download: +10
- Product Page Visit: +15
- Case Study Read: +10
- Webinar Registration: +20
- Consultation Request: +30
- Product Purchase: +100

Set SQL threshold: 50 points

**Step 6: Set Up Segments**

Create segments:
1. **Newsletter Subscribers** (tag: newsletter_subscriber)
2. **Product Interest** (visited product pages)
3. **Sales Qualified Leads** (50+ points)
4. **Customers** (made purchase)

---

## 🔧 Build & Deploy

### Local Testing

```bash
# Navigate to project
cd /Users/ciromoraes/Documents/THE-Code-Base/olcan-compass/apps/site-marketing-v2.5

# Install dependencies (if not already done)
npm install

# Create .env.local with your credentials
cp .env.example .env.local
# Edit .env.local with real values

# Run development server
npm run dev

# Test in browser
open http://localhost:3000

# Test tracking (open browser console)
# You should see [Analytics] logs for events
```

### Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Verify build output
ls -la .next/
```

### Deploy to Vercel (Recommended)

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Login to Vercel**
```bash
vercel login
```

**Step 3: Deploy**
```bash
# From project directory
cd /Users/ciromoraes/Documents/THE-Code-Base/olcan-compass/apps/site-marketing-v2.5

# Deploy to production
vercel --prod

# Follow prompts:
# - Project name: olcan-website
# - Framework: Next.js
# - Build command: npm run build
# - Output directory: .next
```

**Step 4: Configure Environment Variables in Vercel**

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Set environment: Production
4. Redeploy

**Step 5: Configure Custom Domain**

In Vercel Dashboard:
1. Go to Project Settings → Domains
2. Add domain: www.olcan.com.br
3. Add domain: olcan.com.br (redirect to www)
4. Update DNS records as instructed

### Alternative: Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Configure environment variables in Netlify dashboard
```

---

## 🔍 Post-Deployment Verification

### 1. Test Analytics Tracking

**Open Browser Console** on deployed site:

```javascript
// Should see these logs:
[Analytics] page_view { page_location: "/", page_title: "Olcan | Capacitação Internacional" }
[Analytics] scroll_depth { scroll_percentage: 25 }
[Mautic] Page view tracked: /
```

**Verify in Google Analytics**:
1. Go to GA4 Realtime report
2. Visit your website
3. Should see your visit in realtime
4. Check Events tab for custom events

**Verify in Mautic**:
1. Go to Mautic Dashboard
2. Check Contacts → Anonymous Visitors
3. Should see your visit tracked

### 2. Test Lead Capture Forms

**Newsletter Signup**:
1. Enter email in homepage form
2. Submit
3. Check Mautic Contacts - should see new contact
4. Check email - should receive welcome email

**Resource Download**:
1. Visit /recursos page
2. Download a resource
3. Check Mautic - should add 10 points
4. Should receive download link email

### 3. Test Cookie Consent

1. Visit site in incognito mode
2. Should see cookie consent banner
3. Click "Aceitar Cookies"
4. Banner should disappear
5. Tracking should be enabled

### 4. Test Mobile Responsiveness

Test on:
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)
- Desktop (Chrome, Firefox, Safari)

Verify:
- Navigation works
- Forms are usable
- Buttons are tappable (44px minimum)
- Text is readable (16px minimum)
- Images load properly

---

## 📊 Monitoring & Analytics

### Google Analytics 4 Dashboard

**Key Reports to Monitor**:
1. **Realtime**: Current visitors
2. **Acquisition**: Traffic sources
3. **Engagement**: Pages, events
4. **Conversions**: Goal completions
5. **Monetization**: Revenue (if e-commerce enabled)

**Custom Reports to Create**:
1. **Marketing Funnel**:
   - Page views → Newsletter signups → Product views → Purchases
2. **Content Performance**:
   - Blog posts by engagement
3. **Product Performance**:
   - Product page views and conversions

### Mautic Dashboard

**Daily Monitoring**:
1. **New Contacts**: Check daily signups
2. **Campaign Performance**: Email open/click rates
3. **Lead Scoring**: Identify SQLs (50+ points)
4. **Form Submissions**: Track conversions

**Weekly Review**:
1. **Segment Growth**: Newsletter, SQLs, Customers
2. **Email Performance**: Open rates, click rates, unsubscribes
3. **Campaign ROI**: Revenue per campaign
4. **A/B Test Results**: Winning variations

---

## 🔐 Security & Compliance

### LGPD Compliance Checklist

- [x] Cookie consent banner implemented
- [x] Privacy policy page created
- [x] Terms of use page created
- [x] Cookie policy page created
- [ ] Data processing agreement with Mautic
- [ ] User data export functionality
- [ ] User data deletion functionality
- [ ] Consent tracking in Mautic

### Security Best Practices

1. **Environment Variables**: Never commit `.env.local` to git
2. **API Keys**: Use read-only keys where possible
3. **HTTPS**: Ensure SSL certificate is active
4. **CSP Headers**: Configure Content Security Policy
5. **Rate Limiting**: Implement on forms to prevent spam

---

## 🐛 Troubleshooting

### Analytics Not Tracking

**Issue**: No events showing in GA4

**Solutions**:
1. Check `NEXT_PUBLIC_GA_ID` is correct
2. Verify GA4 property is active
3. Check browser console for errors
4. Disable ad blockers
5. Wait 24-48 hours for data to appear

### Mautic Not Receiving Data

**Issue**: Contacts not being created

**Solutions**:
1. Verify `NEXT_PUBLIC_MAUTIC_URL` is correct
2. Check Mautic API is enabled
3. Verify API credentials are valid
4. Check CORS settings in Mautic
5. Review Mautic logs for errors

### Build Errors

**Issue**: `npm run build` fails

**Solutions**:
1. Delete `.next` folder: `rm -rf .next`
2. Delete `node_modules`: `rm -rf node_modules`
3. Reinstall: `npm install`
4. Clear cache: `npm cache clean --force`
5. Rebuild: `npm run build`

### Cookie Consent Not Showing

**Issue**: Banner doesn't appear

**Solutions**:
1. Clear browser localStorage
2. Open in incognito mode
3. Check browser console for errors
4. Verify component is imported in layout

---

## 📈 Performance Optimization

### Lighthouse Targets

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 100

### Optimization Checklist

- [x] Images optimized (WebP format)
- [x] Lazy loading enabled
- [x] Code splitting (Next.js automatic)
- [x] CSS minification
- [x] JavaScript minification
- [ ] CDN for static assets
- [ ] Image CDN (Cloudinary/Imgix)
- [ ] Caching headers configured

---

## 🎯 Success Metrics - First 30 Days

### Traffic Goals
- 5,000 unique visitors
- 60% organic search traffic
- <40% bounce rate
- >3 min average session

### Conversion Goals
- 250 newsletter signups (5% conversion)
- 100 resource downloads (2% conversion)
- 50 product page visits
- 10 course enrollments (2% of product views)

### Revenue Goals
- R$5,000 total revenue
- R$500 average order value
- <R$200 customer acquisition cost

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Daily**:
- Monitor analytics for anomalies
- Check Mautic for new SQLs
- Review form submissions

**Weekly**:
- Review campaign performance
- Update blog content
- Check for broken links
- Review error logs

**Monthly**:
- Security updates
- Dependency updates
- Performance audit
- Content refresh

### Getting Help

**Technical Issues**:
- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs
- Mautic: https://docs.mautic.org

**Analytics Issues**:
- GA4: https://support.google.com/analytics
- Mautic Community: https://forum.mautic.org

---

## ✅ Deployment Complete

Once deployed, your website will have:

1. ✅ **Full Analytics**: GA4 + Mautic tracking
2. ✅ **Marketing Automation**: Email workflows and lead scoring
3. ✅ **LGPD Compliance**: Cookie consent and privacy policies
4. ✅ **SEO Optimization**: Meta tags and structured data
5. ✅ **Mobile-First Design**: Responsive across all devices
6. ✅ **Brand Consistency**: Olcan Navy Blue, liquid-glass aesthetic
7. ✅ **Conversion Optimization**: Clear CTAs and funnels

**The website is now a complete marketing machine ready to drive growth for Olcan.**

---

**Deployment Status**: ✅ Ready for Production  
**Last Updated**: March 27, 2026  
**Next Review**: April 27, 2026
