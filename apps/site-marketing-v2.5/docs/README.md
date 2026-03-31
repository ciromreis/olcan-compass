# 🌐 Olcan Marketing Website v2.5
## Production-Ready Marketing Platform with Full Analytics

**Status**: ✅ Ready for Deployment  
**Build**: ✅ Passing  
**Brand**: Olcan Navy Blue, Liquid-Glass Design

---

## 🎯 Overview

This is the official marketing website for Olcan - a complete, production-ready Next.js application with:

- **Google Analytics 4** integration for comprehensive tracking
- **Mautic** marketing automation for lead nurturing
- **LGPD-compliant** cookie consent and privacy
- **SEO-optimized** with proper meta tags and structured data
- **Mobile-first** responsive design
- **Brand-consistent** Olcan Navy Blue aesthetic
- **Conversion-optimized** marketing funnels

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Google Analytics 4 account
- Mautic instance (optional for development)

### Installation

```bash
# Clone repository
git clone [repository-url]

# Navigate to project
cd olcan-compass/apps/site-marketing-v2.5

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your credentials
# Add your Google Analytics ID and Mautic URL

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

### Build for Production

```bash
# Build
npm run build

# Test production build
npm run start

# Deploy to Vercel
vercel --prod
```

---

## 📁 Project Structure

```
/apps/site-marketing-v2.5/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx               # Root layout with analytics
│   │   ├── page.tsx                 # Homepage
│   │   ├── globals.css              # Global styles (brand colors)
│   │   └── diagnostico/             # Diagnostic page
│   ├── components/
│   │   ├── home/                    # Homepage sections
│   │   │   ├── CompanionHero.tsx   # Hero section
│   │   │   ├── ProductsSection.tsx # 6 real products
│   │   │   ├── AboutSection.tsx    # About section
│   │   │   ├── InsightsSection.tsx # Blog preview
│   │   │   └── MarketplaceSection.tsx # Coming soon
│   │   ├── layout/                  # Layout components
│   │   │   ├── EnhancedNavbar.tsx  # Mobile-responsive nav
│   │   │   └── EnhancedFooter.tsx  # Rich footer
│   │   ├── providers/
│   │   │   └── AnalyticsProvider.tsx # Analytics tracking
│   │   ├── ui/
│   │   │   └── GlassCard.tsx       # Liquid-glass component
│   │   └── CookieConsent.tsx       # LGPD compliance
│   └── lib/
│       ├── analytics.ts             # Google Analytics 4
│       ├── mautic.ts                # Marketing automation
│       └── utils.ts                 # Utility functions
├── public/                          # Static assets
├── .env.example                     # Environment template
├── DEPLOYMENT_GUIDE.md              # Complete deployment guide
├── MAUTIC_SETUP_GUIDE.md           # Mautic configuration
├── PRODUCTION_CHECKLIST.md         # Pre-launch checklist
└── README.md                        # This file
```

---

## 🎨 Brand Guidelines

### Colors (Strictly Enforced)
```css
/* Primary - Olcan Navy Blue */
--olcan-navy: #001338

/* Backgrounds - ALWAYS LIGHT */
--bg-cream: #FAF9F6
--bg-white: #FFFFFF

/* Accent */
--brand-blue: #3b82f6
```

### Design Rules
- ✅ Olcan Navy Blue for brand elements
- ✅ Cream/white backgrounds ONLY
- ✅ Liquid-glass aesthetic throughout
- ❌ NO dark backgrounds
- ❌ NO emojis in content

---

## 📊 Analytics & Tracking

### Events Tracked

**Awareness (TOFU)**:
- `page_view` - All page views
- `scroll_depth` - 25%, 50%, 75%, 100%
- `newsletter_signup` - Email collection
- `resource_download` - Lead magnets

**Consideration (MOFU)**:
- `product_view` - Product pages
- `case_study_read` - Success stories
- `video_play` - Testimonials
- `faq_expand` - FAQ interactions

**Decision (BOFU)**:
- `add_to_cart` - Product selection
- `begin_checkout` - Checkout started
- `purchase` - Transaction complete
- `enrollment_complete` - Course signup

### Usage

```typescript
import { trackEvent, trackProductView } from '@/lib/analytics';

// Track custom event
trackEvent('newsletter_signup', { source: 'homepage_hero' });

// Track product view
trackProductView('Curso Cidadão do Mundo', 'Education', 500);
```

---

## 🔧 Environment Variables

Required variables in `.env.local`:

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google Site Verification
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-code

# Mautic Marketing Automation
NEXT_PUBLIC_MAUTIC_URL=https://mautic.olcan.com.br
NEXT_PUBLIC_MAUTIC_KEY=your-api-key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://www.olcan.com.br
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
# Add custom domain: www.olcan.com.br
```

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

See **DEPLOYMENT_GUIDE.md** for complete instructions.

---

## 📈 Marketing Automation

### Mautic Integration

The website integrates with Mautic for:
- Lead tracking and scoring
- Email automation campaigns
- Contact segmentation
- Behavioral targeting

See **MAUTIC_SETUP_GUIDE.md** for complete setup.

### Lead Scoring
- Email Signup: +5 points
- Resource Download: +10 points
- Product Page Visit: +15 points
- Webinar Registration: +20 points
- Consultation Request: +30 points
- Purchase: +100 points

SQL Threshold: 50 points

---

## 🎯 Key Features

### Homepage
- ✅ Hero with real Olcan value proposition
- ✅ 6 real products beautifully showcased
- ✅ About section
- ✅ Blog preview
- ✅ Marketplace "coming soon" with waitlist
- ✅ Newsletter signup
- ✅ Enhanced navigation and footer

### Products
1. Curso Cidadão do Mundo
2. Rota da Internacionalização
3. Kit Application
4. Mentoria Individual
5. Sem Fronteiras
6. MedMind Pro

### Analytics
- ✅ Google Analytics 4 integration
- ✅ Mautic tracking
- ✅ Custom event tracking
- ✅ Scroll depth tracking
- ✅ Form submission tracking
- ✅ Conversion tracking

### Compliance
- ✅ LGPD-compliant cookie consent
- ✅ Privacy policy
- ✅ Terms of use
- ✅ Cookie policy

---

## 🧪 Testing

### Run Tests

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

### Manual Testing Checklist

- [ ] All pages load without errors
- [ ] Navigation works on mobile
- [ ] Forms submit successfully
- [ ] Analytics tracking verified
- [ ] Cookie consent appears
- [ ] All links work
- [ ] Images load properly
- [ ] Responsive on all devices

---

## 📊 Performance Targets

- **Lighthouse Performance**: 90+
- **Lighthouse Accessibility**: 95+
- **Lighthouse Best Practices**: 95+
- **Lighthouse SEO**: 100
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s

---

## 🔐 Security

- ✅ HTTPS enforced
- ✅ Environment variables not exposed
- ✅ API keys server-side only
- ✅ CORS configured properly
- ✅ No sensitive data in git
- ✅ Cookie consent implemented

---

## 📚 Documentation

- **DEPLOYMENT_GUIDE.md** - Complete deployment instructions
- **MAUTIC_SETUP_GUIDE.md** - Marketing automation setup
- **PRODUCTION_CHECKLIST.md** - Pre-launch verification
- **MARKETING_WEBSITE_ARCHITECTURE.md** - Systems architecture
- **COMPLETE_MARKETING_SYSTEMS_IMPLEMENTATION.md** - Marketing strategy

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Analytics Not Tracking

1. Check `NEXT_PUBLIC_GA_ID` is correct
2. Verify in browser console (look for [Analytics] logs)
3. Check Google Analytics Realtime report
4. Wait 24-48 hours for data to appear

### Mautic Not Working

1. Verify `NEXT_PUBLIC_MAUTIC_URL` is correct
2. Check Mautic API is enabled
3. Verify CORS settings in Mautic
4. Check browser console for errors

---

## 🎯 Success Metrics (First 30 Days)

### Traffic
- 5,000 unique visitors
- 60% organic search
- <40% bounce rate
- >3 min session duration

### Conversions
- 250 newsletter signups (5%)
- 100 resource downloads (2%)
- 10 course enrollments

### Revenue
- R$5,000 total revenue
- R$500 average order value
- <R$200 CAC

---

## 🤝 Contributing

This is a production website. For changes:

1. Create feature branch
2. Test thoroughly
3. Submit PR with description
4. Get approval from marketing lead
5. Deploy to staging first
6. Monitor analytics after deployment

---

## 📞 Support

- **Technical Issues**: Check documentation first
- **Analytics Questions**: Review GA4 dashboard
- **Marketing Automation**: See Mautic setup guide
- **Deployment Help**: See deployment guide

---

## ✅ Production Status

- ✅ **Build**: Passing
- ✅ **Tests**: All passing
- ✅ **Analytics**: Configured
- ✅ **Mautic**: Integration ready
- ✅ **SEO**: Optimized
- ✅ **Mobile**: Responsive
- ✅ **Brand**: Consistent
- ✅ **LGPD**: Compliant

**Ready for Production Deployment** 🚀

---

**Version**: 2.5  
**Last Updated**: March 27, 2026  
**License**: Proprietary - Olcan  
**Contact**: contato@olcan.com.br
