# 🎯 Olcan Marketing Website - Complete Architecture
## Head of Marketing Perspective - Systems & Strategy

**Date**: March 27, 2026  
**Version**: 2.5  
**Domain**: www.olcan.com.br

---

## 🎨 Brand Guidelines - Strict Enforcement

### Visual Identity
- **Primary Color**: Olcan Navy Blue (#001338)
- **Secondary Colors**: Cream (#FAF9F6), White (#FFFFFF)
- **Accent Colors**: Brand Blue (#3b82f6), Subtle grays
- **NO Dark Backgrounds**: Always light backgrounds (cream/white)
- **NO Emojis**: Professional, sophisticated tone only
- **Design System**: Liquid-glass aesthetic throughout

### Typography
- **Headings**: Display font, Navy Blue
- **Body**: Clean sans-serif, Dark gray (#1f2937)
- **Links**: Brand Blue with Navy Blue hover
- **Hierarchy**: Clear visual distinction between levels

### Component Style
- **Glass Effect**: backdrop-blur with white/cream overlays
- **Borders**: Subtle white/cream borders (border-white/30)
- **Shadows**: Soft, elevated shadows for depth
- **Animations**: Smooth, purposeful (300ms transitions)
- **Spacing**: Generous whitespace, breathable layouts

---

## 📊 Complete Website Content Tree

### Level 1: Primary Navigation

```
www.olcan.com.br/
├── Home (/)
├── Quem Somos (/quem-somos)
├── Produtos (/produtos)
│   ├── Curso Cidadão do Mundo (/produtos/curso-cidadao-mundo)
│   ├── Rota da Internacionalização (/produtos/rota-internacionalizacao)
│   ├── Kit Application (/produtos/kit-application)
│   ├── Mentoria Individual (/produtos/mentoria)
│   ├── Sem Fronteiras (/produtos/sem-fronteiras)
│   └── MedMind Pro (/produtos/medmind-pro)
├── Knowledge Exchange (/knowledge-exchange)
│   ├── Blog (/blog)
│   ├── Recursos (/recursos)
│   ├── Webinars (/webinars)
│   └── Casos de Sucesso (/casos-sucesso)
├── Marketplace (Coming Soon) (/marketplace)
└── Contato (/contato)
```

### Level 2: Supporting Pages

```
Legal & Compliance
├── Política de Privacidade (/politica-privacidade)
├── Termos de Uso (/termos-uso)
├── Política de Cookies (/politica-cookies)
└── Política de Reembolso (/politica-reembolso)

User Account
├── Login (/login)
├── Cadastro (/cadastro)
├── Recuperar Senha (/recuperar-senha)
└── Minha Conta (/minha-conta)

Marketing Pages
├── Obrigado (/obrigado)
├── Confirme seu Email (/confirme-email)
├── Download Recurso (/download/[recurso])
└── Webinar Registro (/webinar/[id]/registro)
```

### Level 3: Dynamic Content

```
Blog Structure
/blog
├── /blog/[categoria]
│   ├── /blog/vistos
│   ├── /blog/carreira-internacional
│   ├── /blog/documentacao
│   └── /blog/destinos
└── /blog/[slug]

Casos de Sucesso
/casos-sucesso
└── /casos-sucesso/[nome-aluno]

Recursos Downloadable
/recursos
├── /recursos/guias
├── /recursos/templates
├── /recursos/checklists
└── /recursos/[slug]
```

---

## 🎯 Marketing Funnel Architecture

### Stage 1: Awareness (TOFU - Top of Funnel)

**Objective**: Attract international mobility seekers

**Pages**:
- Homepage (/)
- Blog (/blog)
- Knowledge Exchange (/knowledge-exchange)
- Recursos Gratuitos (/recursos)

**Content Strategy**:
- SEO-optimized blog posts (2x/month)
- Downloadable guides and checklists
- Educational webinars
- Social media content distribution

**Conversion Goals**:
- Email signup (newsletter)
- Resource download (lead magnet)
- Webinar registration
- Blog engagement (time on page, scroll depth)

**Tracking Events**:
- `page_view` - All pages
- `scroll_depth` - 25%, 50%, 75%, 100%
- `resource_download` - Guide/template downloads
- `newsletter_signup` - Email collection
- `blog_read` - Article completion

---

### Stage 2: Consideration (MOFU - Middle of Funnel)

**Objective**: Educate and build trust

**Pages**:
- Produtos Overview (/produtos)
- Individual Product Pages (/produtos/[produto])
- Casos de Sucesso (/casos-sucesso)
- Quem Somos (/quem-somos)

**Content Strategy**:
- Detailed product information
- Success stories with real results
- Comparison guides
- FAQ sections
- Video testimonials

**Conversion Goals**:
- Product page visits
- Case study engagement
- Consultation booking
- Course preview access

**Tracking Events**:
- `product_view` - Product page visits
- `case_study_read` - Success story engagement
- `video_play` - Testimonial videos
- `faq_expand` - FAQ interactions
- `consultation_request` - Contact form

---

### Stage 3: Decision (BOFU - Bottom of Funnel)

**Objective**: Convert to paying customers

**Pages**:
- Product Landing Pages (optimized for conversion)
- Checkout/Enrollment Pages
- Pricing Comparison
- Limited-time Offers

**Content Strategy**:
- Clear pricing and value proposition
- Social proof (testimonials, numbers)
- Risk reversal (guarantees, refund policy)
- Urgency/scarcity (limited spots, bonuses)
- Clear CTAs

**Conversion Goals**:
- Course enrollment
- Product purchase
- Mentoria booking
- Payment completion

**Tracking Events**:
- `add_to_cart` - Product selection
- `begin_checkout` - Checkout initiated
- `purchase` - Transaction completed
- `enrollment_complete` - Course signup
- `payment_success` - Revenue tracking

---

### Stage 4: Retention & Advocacy

**Objective**: Maximize lifetime value

**Pages**:
- Minha Conta (/minha-conta)
- Student Dashboard
- Community Access (/sem-fronteiras)
- Referral Program

**Content Strategy**:
- Onboarding email sequences
- Progress tracking
- Community engagement
- Upsell opportunities
- Referral incentives

**Conversion Goals**:
- Course completion
- Upsell to premium products
- Referral conversions
- Testimonial collection

**Tracking Events**:
- `course_progress` - Lesson completion
- `community_join` - Sem Fronteiras signup
- `referral_sent` - Referral link shared
- `upsell_purchase` - Additional product bought
- `testimonial_submitted` - Review provided

---

## 📈 Analytics & Tracking Infrastructure

### Google Analytics 4 (GA4) Setup

**Implementation**:
```typescript
// /app/layout.tsx - Global Analytics
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
```

**Custom Events to Track**:
```typescript
// /lib/analytics.ts
export const trackEvent = (eventName: string, parameters?: object) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Usage examples:
trackEvent('product_view', { product_name: 'Curso Cidadão do Mundo' });
trackEvent('newsletter_signup', { source: 'homepage_hero' });
trackEvent('resource_download', { resource_name: 'Guia de Vistos' });
```

**Key Metrics Dashboard**:
- **Traffic Sources**: Organic, Direct, Social, Referral, Paid
- **User Behavior**: Pages/session, Avg. session duration, Bounce rate
- **Conversions**: Newsletter signups, Resource downloads, Enrollments
- **Revenue**: Total revenue, Revenue per user, Product performance
- **Funnel Analysis**: Homepage → Product → Checkout → Purchase

---

### Mautic Integration (Marketing Automation)

**Purpose**: Lead nurturing, email campaigns, behavior tracking

**Implementation Architecture**:
```typescript
// /lib/mautic.ts
export class MauticClient {
  private baseUrl = process.env.NEXT_PUBLIC_MAUTIC_URL;
  private publicKey = process.env.NEXT_PUBLIC_MAUTIC_KEY;

  // Track page view
  async trackPageView(url: string, title: string) {
    await fetch(`${this.baseUrl}/mtracking.gif`, {
      method: 'GET',
      headers: { 'X-Mautic-Page': url }
    });
  }

  // Identify contact
  async identifyContact(email: string, data: object) {
    const payload = {
      email,
      ...data,
      tags: ['website_visitor']
    };
    
    await fetch(`${this.baseUrl}/api/contacts/new`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.publicKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  // Track form submission
  async trackFormSubmit(formId: string, data: object) {
    await fetch(`${this.baseUrl}/form/submit`, {
      method: 'POST',
      body: JSON.stringify({ formId, ...data })
    });
  }
}
```

**Lead Scoring Model**:
```
Email Signup: +5 points
Resource Download: +10 points
Product Page Visit: +15 points
Case Study Read: +10 points
Webinar Registration: +20 points
Consultation Request: +30 points
Product Purchase: +100 points

Threshold for Sales Qualified Lead (SQL): 50 points
```

**Email Automation Workflows**:

1. **Welcome Sequence** (Triggered: Newsletter signup)
   - Day 0: Welcome + Resource link
   - Day 2: Introduce Curso Cidadão do Mundo
   - Day 5: Success story + Social proof
   - Day 7: Limited-time offer

2. **Product Interest** (Triggered: Product page visit)
   - Immediate: Product overview email
   - Day 1: Detailed features + FAQ
   - Day 3: Testimonials + Case study
   - Day 5: Special offer + Urgency

3. **Abandoned Cart** (Triggered: Checkout not completed)
   - 1 hour: Reminder email
   - 24 hours: Incentive (discount/bonus)
   - 3 days: Final reminder + Scarcity

4. **Post-Purchase** (Triggered: Enrollment)
   - Immediate: Welcome + Access details
   - Day 1: Getting started guide
   - Day 7: Check-in + Support offer
   - Day 30: Upsell opportunity

---

## 🎨 Design System Implementation

### Color Palette (Strict)
```css
/* /app/globals.css */
:root {
  /* Primary - Olcan Navy Blue */
  --olcan-navy: #001338;
  --olcan-navy-light: #16284d;
  --olcan-navy-dark: #000a1f;
  
  /* Backgrounds - Always Light */
  --bg-cream: #FAF9F6;
  --bg-white: #FFFFFF;
  --bg-cream-50: #FDFCFB;
  
  /* Brand Accent */
  --brand-blue: #3b82f6;
  --brand-blue-light: #60a5fa;
  --brand-blue-dark: #2563eb;
  
  /* Text */
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  
  /* Liquid Glass Effect */
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-shadow: 0 8px 32px rgba(1, 19, 56, 0.1);
}

/* NO DARK BACKGROUNDS - Enforce */
body, main, section {
  background: var(--bg-cream) !important;
}

.dark-bg {
  display: none !important; /* Prevent dark backgrounds */
}
```

### Liquid Glass Components
```typescript
// /components/ui/GlassCard.tsx
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div className={cn(
      "bg-white/70 backdrop-blur-xl",
      "border border-white/30",
      "shadow-[0_8px_32px_rgba(1,19,56,0.1)]",
      "rounded-2xl p-6",
      hover && "hover:shadow-[0_16px_48px_rgba(1,19,56,0.15)] transition-all duration-300",
      className
    )}>
      {children}
    </div>
  );
}
```

---

## 🔧 Technical Implementation

### SEO Infrastructure

**Meta Tags Template**:
```typescript
// /app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://www.olcan.com.br'),
  title: {
    default: 'Olcan | Capacitação Internacional',
    template: '%s | Olcan'
  },
  description: 'Cursos, mentorias e ferramentas para sua mobilidade internacional. Transforme seu sonho global em realidade.',
  keywords: ['mobilidade internacional', 'visto trabalho', 'carreira internacional', 'intercâmbio', 'emigração'],
  authors: [{ name: 'Olcan' }],
  creator: 'Olcan',
  publisher: 'Olcan',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://www.olcan.com.br',
    siteName: 'Olcan',
    images: ['/og-image.jpg']
  },
  twitter: {
    card: 'summary_large_image',
    site: '@olcan',
    creator: '@olcan'
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
};
```

**Structured Data (JSON-LD)**:
```typescript
// /components/StructuredData.tsx
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Olcan",
    "url": "https://www.olcan.com.br",
    "logo": "https://www.olcan.com.br/logo.png",
    "description": "Capacitação internacional para mobilidade global",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BR"
    },
    "sameAs": [
      "https://www.linkedin.com/company/olcan",
      "https://www.instagram.com/olcan"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

---

## 📝 Lead Capture Strategy

### Form Placement Points

1. **Homepage Hero**: Newsletter signup
2. **Blog Sidebar**: Resource download
3. **Product Pages**: Consultation request
4. **Exit Intent**: Special offer popup
5. **Footer**: Newsletter (all pages)
6. **Resource Pages**: Email gate for download

### Form Design (Brand Consistent)
```typescript
// /components/forms/LeadCaptureForm.tsx
export function LeadCaptureForm({ 
  source, 
  ctaText = "Receber Conteúdo" 
}: LeadCaptureFormProps) {
  const handleSubmit = async (data: FormData) => {
    // Track in GA4
    trackEvent('lead_capture', { source });
    
    // Send to Mautic
    await mautic.identifyContact(data.email, {
      firstName: data.firstName,
      source,
      tags: ['newsletter_subscriber']
    });
    
    // Subscribe to email list
    await subscribeToNewsletter(data.email);
  };

  return (
    <form className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-xl p-6">
      <input
        type="email"
        placeholder="Seu melhor e-mail"
        className="w-full px-4 py-3 bg-white border border-cream-300 rounded-lg"
      />
      <button className="w-full mt-3 px-6 py-3 bg-olcan-navy text-white rounded-lg hover:bg-olcan-navy-light transition-colors">
        {ctaText}
      </button>
    </form>
  );
}
```

---

## 🎯 Conversion Rate Optimization (CRO)

### A/B Testing Framework
```typescript
// /lib/experiments.ts
export function useExperiment(experimentId: string) {
  const variant = useMemo(() => {
    // Assign user to variant (A or B)
    const hash = hashString(experimentId + userId);
    return hash % 2 === 0 ? 'A' : 'B';
  }, [experimentId]);

  useEffect(() => {
    // Track experiment view
    trackEvent('experiment_view', {
      experiment_id: experimentId,
      variant
    });
  }, [experimentId, variant]);

  return variant;
}

// Usage:
const heroVariant = useExperiment('homepage_hero_v1');
```

### Elements to Test
- Hero headline variations
- CTA button copy and color
- Product page layouts
- Pricing presentation
- Form field requirements
- Social proof placement

---

## 📊 Marketing Dashboard KPIs

### Traffic Metrics
- **Monthly Unique Visitors**: Target 10K
- **Organic Search Traffic**: 60% of total
- **Bounce Rate**: <40%
- **Avg. Session Duration**: >3 minutes
- **Pages per Session**: >3

### Conversion Metrics
- **Newsletter Signup Rate**: 5% of visitors
- **Resource Download Rate**: 3% of visitors
- **Product Page Conversion**: 10% to consultation
- **Checkout Conversion**: 30% completion rate
- **Overall Visitor-to-Customer**: 2%

### Revenue Metrics
- **Monthly Revenue**: Track by product
- **Average Order Value (AOV)**: Target R$500+
- **Customer Lifetime Value (CLV)**: Target R$2,000
- **Customer Acquisition Cost (CAC)**: <R$200
- **CAC:CLV Ratio**: 1:10 minimum

### Engagement Metrics
- **Email Open Rate**: >30%
- **Email Click Rate**: >5%
- **Blog Engagement**: >4 min avg. time
- **Video Completion**: >60%
- **Social Shares**: Track per content piece

---

## 🔄 Marketing Automation Workflows

### Workflow 1: New Subscriber Journey
```
Trigger: Newsletter signup
├── Day 0: Welcome email + Free guide
├── Day 2: Introduce Curso Cidadão do Mundo
├── Day 5: Success story (case study)
├── Day 7: Limited offer (10% discount)
└── Day 14: Last chance reminder
```

### Workflow 2: Product Interest
```
Trigger: Product page visit (no purchase)
├── 1 hour: Product overview email
├── Day 1: Features + Benefits deep dive
├── Day 3: Testimonials + Social proof
├── Day 5: Special offer + Urgency
└── Day 7: Final reminder
```

### Workflow 3: Abandoned Checkout
```
Trigger: Checkout started, not completed
├── 1 hour: "Complete your enrollment" reminder
├── 24 hours: Offer help + FAQ
├── 3 days: Limited-time discount (5%)
└── 7 days: Final reminder + Scarcity
```

### Workflow 4: Post-Purchase Onboarding
```
Trigger: Course enrollment
├── Day 0: Welcome + Access credentials
├── Day 1: Getting started guide
├── Day 3: First lesson reminder
├── Day 7: Progress check-in
├── Day 14: Community invitation
└── Day 30: Upsell to advanced course
```

---

## 🎯 Content Marketing Calendar

### Blog Publishing Schedule
- **Monday**: SEO-focused guide (1,500+ words)
- **Thursday**: Quick tips or news (800 words)
- **Monthly**: In-depth case study (2,500+ words)

### Content Themes (Rotating)
- Week 1: Visa & Immigration
- Week 2: Career Development
- Week 3: Destination Guides
- Week 4: Success Stories

### Content Distribution
- **Publish**: Blog post on website
- **Day 1**: Share on LinkedIn + Instagram
- **Day 2**: Email to subscribers
- **Day 3**: Repurpose for Twitter thread
- **Day 7**: Create carousel for Instagram
- **Day 14**: Republish on Medium

---

## 🔐 Data Privacy & Compliance

### LGPD Compliance (Brazilian Data Protection)
- Cookie consent banner (required)
- Privacy policy (detailed)
- Data processing agreements
- User data export/deletion requests
- Secure data storage

### Implementation
```typescript
// /components/CookieConsent.tsx
export function CookieConsent() {
  const [consent, setConsent] = useState<boolean | null>(null);

  const acceptCookies = () => {
    setConsent(true);
    // Enable GA4 and Mautic tracking
    window.gtag('consent', 'update', {
      analytics_storage: 'granted'
    });
  };

  return consent === null ? (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-white/30 p-6 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Usamos cookies para melhorar sua experiência. 
          <Link href="/politica-cookies" className="text-brand-blue ml-1">
            Saiba mais
          </Link>
        </p>
        <button
          onClick={acceptCookies}
          className="px-6 py-2 bg-olcan-navy text-white rounded-lg hover:bg-olcan-navy-light"
        >
          Aceitar
        </button>
      </div>
    </div>
  ) : null;
}
```

---

## 📱 Mobile-First Marketing

### Mobile Optimization Priorities
1. **Fast Loading**: <2s on 3G
2. **Touch-Friendly**: 44px minimum tap targets
3. **Readable**: 16px minimum font size
4. **Simple Forms**: Minimal fields, auto-fill
5. **Click-to-Call**: Phone numbers linkable

### Mobile-Specific Features
- WhatsApp floating button
- Mobile-optimized checkout
- One-tap email signup
- Swipeable product galleries
- Mobile-friendly navigation

---

## 🎯 Success Metrics & Goals

### 30-Day Goals
- 5,000 unique visitors
- 250 newsletter signups
- 100 resource downloads
- 50 product page visits
- 10 course enrollments

### 90-Day Goals
- 15,000 unique visitors
- 750 newsletter signups
- 300 resource downloads
- 200 product page visits
- 40 course enrollments
- R$20,000 revenue

### 1-Year Goals
- 100,000 unique visitors
- 5,000 newsletter subscribers
- 2,000 resource downloads
- 1,000 product page visits
- 200 course enrollments
- R$100,000 revenue

---

**This architecture ensures Olcan's website is a complete marketing machine - beautiful, brand-consistent, data-driven, and conversion-optimized.**
