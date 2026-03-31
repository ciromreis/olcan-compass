# 🌐 Olcan Marketing Website v2.5
## Production-Ready Next.js Marketing Platform

**Status**: ✅ Production Ready (Requires Configuration)  
**Build**: ✅ Passing  
**Last Updated**: March 27, 2026

---

## 📋 Quick Overview

This is the official marketing website for Olcan - a complete Next.js 14 application with:
- Google Analytics 4 integration
- Mautic marketing automation
- LGPD-compliant cookie consent
- SEO-optimized pages
- Mobile-first responsive design
- Olcan Navy Blue brand consistency
- Liquid-glass aesthetic

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev

# Open browser
http://localhost:3001

# Build for production
npm run build

# Test production build
npm run start
```

---

## 📁 Project Structure

```
/apps/site-marketing-v2.5/
├── docs/                           # 📚 All documentation
│   ├── HANDOFF_GUIDE.md           # Start here for new developers
│   ├── DEPLOYMENT_GUIDE.md        # Production deployment
│   ├── WORDPRESS_MIGRATION_GUIDE.md # WordPress conversion
│   ├── MAUTIC_SETUP_GUIDE.md      # Marketing automation
│   ├── DEBUGGING_REPORT.md        # Testing & fixes
│   └── [other docs]
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx            # Root layout with analytics
│   │   ├── page.tsx              # Homepage
│   │   ├── globals.css           # Global styles
│   │   ├── blog/                 # Blog pages
│   │   ├── contato/              # Contact page
│   │   ├── diagnostico/          # Diagnostic page
│   │   └── produtos/             # Product landing pages
│   │
│   ├── components/
│   │   ├── home/                 # Homepage sections
│   │   ├── layout/               # Navigation & footer
│   │   ├── templates/            # Reusable page templates
│   │   ├── forms/                # Form components
│   │   ├── blog/                 # Blog components
│   │   ├── providers/            # Context providers
│   │   └── ui/                   # UI components
│   │
│   └── lib/
│       ├── analytics.ts          # Google Analytics 4
│       ├── mautic.ts             # Marketing automation
│       └── utils.ts              # Utility functions
│
├── public/                        # Static assets
├── .env.example                   # Environment template
├── package.json                   # Dependencies
└── tailwind.config.ts             # Tailwind configuration
```

---

## 🔧 Environment Variables

Required in `.env.local`:

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

## 📊 Current Status

### ✅ Complete & Working
- Homepage with hero, products, blog preview
- 3 product landing pages (Curso, Rota, Kit)
- Blog listing page with filters
- Contact page with form
- Analytics integration (GA4 + Mautic)
- Cookie consent (LGPD compliant)
- Responsive design (mobile-first)
- Accessibility (WCAG AA)
- Build passing (no errors)

### ⏳ Needs Completion
- 3 remaining product pages (Mentoria, Sem Fronteiras, MedMind)
- Legal pages (Privacy, Terms, Cookies, Refund)
- Individual blog post template
- About page
- Real photography/images
- Payment integration

### ⚙️ Needs Configuration
- Google Analytics ID
- Mautic instance URL
- Email service
- Domain setup
- SSL certificate

---

## 🎨 Design System

### Brand Colors
```css
--olcan-navy:      #001338  /* Primary brand */
--bg-cream:        #FAF9F6  /* Background */
--brand-blue:      #3b82f6  /* Accents/CTAs */
```

### Design Rules
- ✅ Olcan Navy Blue for brand elements
- ✅ Cream/white backgrounds ONLY
- ✅ Liquid-glass aesthetic (backdrop-blur)
- ❌ NO dark backgrounds
- ❌ NO emojis in content

### Typography
- Display: DM Serif Display (headings)
- Body: DM Sans (content)

---

## 📚 Documentation

**Start Here**:
1. `docs/HANDOFF_GUIDE.md` - Complete handoff for new developers
2. `docs/DEPLOYMENT_GUIDE.md` - Production deployment steps
3. `docs/DEBUGGING_REPORT.md` - Testing results & fixes

**Marketing Setup**:
4. `docs/MAUTIC_SETUP_GUIDE.md` - Marketing automation
5. `docs/WORDPRESS_MIGRATION_GUIDE.md` - WordPress conversion

**Architecture**:
6. `docs/COMPLETE_SITEMAP_IMPLEMENTATION.md` - Page structure
7. `docs/REDESIGN_COMPLETE_SUMMARY.md` - Design improvements

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod
```

### WordPress/Hostinger
See `docs/WORDPRESS_MIGRATION_GUIDE.md`

---

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

---

## 📞 Support

- **Documentation**: `/docs` folder
- **Issues**: Check `DEBUGGING_REPORT.md`
- **Deployment**: See `DEPLOYMENT_GUIDE.md`

---

## 🎯 Key Features

- **Analytics**: Full GA4 + Mautic tracking
- **SEO**: Optimized meta tags, structured data
- **Performance**: 154KB first load, static generation
- **Accessibility**: WCAG 2.1 AA compliant
- **Mobile**: Responsive, touch-optimized
- **Brand**: Consistent Olcan Navy Blue aesthetic

---

## ⚡ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Analytics**: Google Analytics 4
- **Marketing**: Mautic
- **Deployment**: Vercel/Netlify

---

**For complete setup instructions, see `docs/HANDOFF_GUIDE.md`**
