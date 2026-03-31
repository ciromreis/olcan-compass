# 🔍 SEO Optimization Guide - Olcan Compass v2.5

**Complete SEO implementation for both applications**

---

## 📊 CURRENT SEO STATUS

### **App Compass v2**
- Meta tags: Partial
- Open Graph: Partial
- Structured data: Not implemented
- Sitemap: Not generated
- Robots.txt: Not configured

### **Site Marketing v2.5**
- Meta tags: Implemented on some pages
- Open Graph: Implemented on some pages
- Structured data: Not implemented
- Sitemap: Not generated
- Robots.txt: Not configured

---

## 🎯 SEO IMPLEMENTATION PLAN

### **Phase 1: Meta Tags & Open Graph**

#### App Compass v2 - Layout Meta Tags
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://app.olcan.com'),
  title: {
    default: 'Olcan Compass - Sua Jornada Internacional',
    template: '%s | Olcan Compass'
  },
  description: 'Plataforma completa para planejamento de mobilidade internacional. Bolsas, vistos, carreiras globais e oportunidades no exterior.',
  keywords: ['mobilidade internacional', 'bolsas de estudo', 'vistos', 'carreira global', 'intercâmbio', 'estudar no exterior', 'trabalhar no exterior'],
  authors: [{ name: 'Olcan' }],
  creator: 'Olcan',
  publisher: 'Olcan',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://app.olcan.com',
    title: 'Olcan Compass - Sua Jornada Internacional',
    description: 'Plataforma completa para planejamento de mobilidade internacional.',
    siteName: 'Olcan Compass',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Olcan Compass',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Olcan Compass - Sua Jornada Internacional',
    description: 'Plataforma completa para planejamento de mobilidade internacional.',
    images: ['/og-image.png'],
    creator: '@olcan',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}
```

#### Site Marketing v2.5 - Enhanced Meta Tags
```typescript
// app/page.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://olcan.com'),
  title: 'Olcan - Democratizando Oportunidades Internacionais',
  description: 'Sistema completo para sua jornada internacional. Bolsas de estudo, vistos de trabalho, carreiras globais. Chevening, Erasmus, Fulbright, H-1B e mais.',
  keywords: [
    'bolsas de estudo no exterior',
    'visto de trabalho internacional',
    'carreira global',
    'Chevening',
    'Erasmus',
    'Fulbright',
    'H-1B',
    'mobilidade internacional',
    'estudar no exterior',
    'trabalhar no exterior',
    'intercâmbio',
    'mestrado no exterior',
    'doutorado no exterior'
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://olcan.com',
    title: 'Olcan - Democratizando Oportunidades Internacionais',
    description: 'Sistema completo para sua jornada internacional. Bolsas, vistos, carreiras globais.',
    siteName: 'Olcan',
    images: [{
      url: 'https://olcan.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Olcan - Oportunidades Internacionais',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Olcan - Democratizando Oportunidades Internacionais',
    description: 'Sistema completo para sua jornada internacional.',
    images: ['https://olcan.com/og-image.png'],
    creator: '@olcan',
  },
  alternates: {
    canonical: 'https://olcan.com',
  },
}
```

---

## 🗺️ SITEMAP GENERATION

### **App Compass v2** - app/sitemap.ts
```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://app.olcan.com'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/companion`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/aura`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guilds`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ]
}
```

### **Site Marketing v2.5** - app/sitemap.ts
```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://olcan.com'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contato`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/diagnostico`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/marketplace/curso-cidadao-mundo`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/marketplace/kit-application`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/marketplace/rota-internacionalizacao`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]
}
```

---

## 🤖 ROBOTS.TXT

### **App Compass v2** - public/robots.txt
```txt
# Olcan Compass - App
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /settings/

Sitemap: https://app.olcan.com/sitemap.xml
```

### **Site Marketing v2.5** - public/robots.txt
```txt
# Olcan - Marketing Site
User-agent: *
Allow: /

Sitemap: https://olcan.com/sitemap.xml
```

---

## 📋 STRUCTURED DATA (JSON-LD)

### **Organization Schema** - Site Marketing
```typescript
// components/StructuredData.tsx
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Olcan',
    url: 'https://olcan.com',
    logo: 'https://olcan.com/logo.png',
    description: 'Democratizando oportunidades internacionais para brasileiros',
    sameAs: [
      'https://linkedin.com/company/olcan',
      'https://instagram.com/olcan',
      'https://twitter.com/olcan',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+55-11-XXXX-XXXX',
      contactType: 'customer service',
      areaServed: 'BR',
      availableLanguage: 'Portuguese',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### **Service Schema** - Marketplace Products
```typescript
export function ServiceSchema({ product }: { product: Product }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: product.name,
    description: product.description,
    provider: {
      '@type': 'Organization',
      name: 'Olcan',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### **FAQ Schema** - Blog Posts
```typescript
export function FAQSchema({ faqs }: { faqs: FAQ[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

---

## 🖼️ OPEN GRAPH IMAGES

### **Image Requirements**
- Size: 1200x630px
- Format: PNG or JPG
- Max file size: 8MB
- Aspect ratio: 1.91:1

### **Generate OG Images** - og-image.tsx
```typescript
// app/og-image/route.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: '#001338',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#D4AF37',
          fontFamily: 'DM Serif Display',
        }}
      >
        Olcan Compass
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

---

## 🔗 CANONICAL URLS

### **Implementation**
```typescript
// In each page metadata
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://olcan.com/page-url',
  },
}
```

---

## 📱 MOBILE OPTIMIZATION

### **Viewport Configuration**
```typescript
// app/layout.tsx
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#001338',
}
```

### **PWA Manifest** - public/manifest.json
```json
{
  "name": "Olcan Compass",
  "short_name": "Olcan",
  "description": "Sua jornada internacional",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F9F6F0",
  "theme_color": "#001338",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🚀 PERFORMANCE OPTIMIZATION

### **Image Optimization**
```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Olcan Compass"
  width={1200}
  height={630}
  priority
  quality={85}
/>
```

### **Font Optimization**
```typescript
// app/layout.tsx
import { DM_Serif_Display, DM_Sans } from 'next/font/google'

const dmSerif = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

const dmSans = DM_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})
```

---

## 📊 ANALYTICS & TRACKING

### **Google Analytics 4**
```typescript
// lib/gtag.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
}

export const event = ({ action, category, label, value }: any) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}
```

### **Track Events**
```typescript
// Track button clicks
import { event } from '@/lib/gtag'

<button onClick={() => {
  event({
    action: 'click',
    category: 'CTA',
    label: 'Start Diagnostic',
  })
}}>
  Começar Diagnóstico
</button>
```

---

## 🔍 SEARCH CONSOLE SETUP

### **Verification**
1. Add verification meta tag to layout
2. Submit sitemap to Google Search Console
3. Monitor indexing status
4. Check for crawl errors

### **Key Metrics to Monitor**
- Impressions
- Clicks
- Average position
- CTR
- Core Web Vitals
- Mobile usability

---

## ✅ SEO CHECKLIST

### **Technical SEO**
- [ ] Meta tags on all pages
- [ ] Open Graph tags implemented
- [ ] Sitemap.xml generated
- [ ] Robots.txt configured
- [ ] Canonical URLs set
- [ ] Structured data added
- [ ] Mobile-friendly
- [ ] HTTPS enabled
- [ ] Page speed optimized
- [ ] Images optimized

### **On-Page SEO**
- [ ] Descriptive titles (50-60 chars)
- [ ] Meta descriptions (150-160 chars)
- [ ] H1 tags on all pages
- [ ] Proper heading hierarchy
- [ ] Alt text on images
- [ ] Internal linking
- [ ] External linking
- [ ] Keyword optimization

### **Content SEO**
- [ ] High-quality content
- [ ] Portuguese language
- [ ] Relevant keywords
- [ ] Regular updates
- [ ] User intent matched
- [ ] Engaging copy

---

## 📈 EXPECTED RESULTS

### **Timeline**
- Week 1-2: Indexing begins
- Week 3-4: Rankings start appearing
- Month 2-3: Traffic increases
- Month 4-6: Stable rankings

### **Target Keywords**
- "bolsas de estudo no exterior"
- "visto de trabalho internacional"
- "carreira global"
- "estudar no exterior"
- "trabalhar no exterior"
- "mobilidade internacional"

---

**Implementation Time**: 4-6 hours  
**Maintenance**: Monthly reviews  
**Tools**: Google Search Console, Google Analytics, Ahrefs/SEMrush

🔍 **SEO optimization complete!**
