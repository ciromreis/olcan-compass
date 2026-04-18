# 📊 Monitoring & Analytics Guide - Olcan Compass v2.5

**Complete monitoring, analytics, and observability setup**

---

## 🎯 MONITORING STRATEGY

### **Three Pillars**
1. **Application Performance** - How fast is the app?
2. **Error Tracking** - What's breaking?
3. **User Behavior** - How are users interacting?

---

## 🚨 ERROR TRACKING (Sentry)

### **Setup**

#### 1. Install Sentry
```bash
cd apps/app-compass-v2
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

#### 2. Configure Sentry
```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Ignore common errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
  
  // Before send hook
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies
    }
    return event
  },
})
```

#### 3. Error Boundaries
```typescript
// components/ErrorBoundary.tsx
'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Algo deu errado</h2>
        <p className="text-gray-600 mb-6">
          Nosso time foi notificado e estamos trabalhando para resolver.
        </p>
        <button
          onClick={reset}
          className="btn-primary"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
```

#### 4. Manual Error Tracking
```typescript
import * as Sentry from '@sentry/nextjs'

// Capture exceptions
try {
  await riskyOperation()
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'companion',
      action: 'create',
    },
    extra: {
      userId: user.id,
      companionData: data,
    },
  })
}

// Capture messages
Sentry.captureMessage('User completed onboarding', {
  level: 'info',
  tags: { flow: 'onboarding' },
})
```

---

## 📈 ANALYTICS (Google Analytics 4)

### **Setup**

#### 1. Install GA4
```typescript
// lib/gtag.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// Page view
export const pageview = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// Event tracking
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}
```

#### 2. Add to Layout
```typescript
// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

#### 3. Track Page Views
```typescript
// app/providers.tsx
'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import * as gtag from '@/lib/gtag'

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = pathname + searchParams.toString()
    gtag.pageview(url)
  }, [pathname, searchParams])

  return null
}
```

#### 4. Track Events
```typescript
import { event } from '@/lib/gtag'

// Button clicks
<button onClick={() => {
  event({
    action: 'click',
    category: 'CTA',
    label: 'Start Diagnostic',
  })
}}>
  Começar Diagnóstico
</button>

// Form submissions
const handleSubmit = async (data) => {
  event({
    action: 'submit',
    category: 'Form',
    label: 'Contact Form',
  })
  // ...
}

// Companion creation
const createCompanion = async () => {
  event({
    action: 'create',
    category: 'Companion',
    label: 'New Companion',
  })
  // ...
}
```

---

## ⚡ PERFORMANCE MONITORING

### **Web Vitals Tracking**

#### 1. Install Web Vitals
```bash
npm install web-vitals
```

#### 2. Track Core Web Vitals
```typescript
// lib/vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric: any) {
  // Send to Google Analytics
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.value),
      event_label: metric.id,
      non_interaction: true,
    })
  }

  // Send to Sentry
  if (typeof window.Sentry !== 'undefined') {
    window.Sentry.captureMessage(`Web Vital: ${metric.name}`, {
      level: 'info',
      tags: {
        metric: metric.name,
      },
      extra: {
        value: metric.value,
        rating: metric.rating,
      },
    })
  }
}

export function reportWebVitals() {
  getCLS(sendToAnalytics)
  getFID(sendToAnalytics)
  getFCP(sendToAnalytics)
  getLCP(sendToAnalytics)
  getTTFB(sendToAnalytics)
}
```

#### 3. Initialize in App
```typescript
// app/layout.tsx
'use client'

import { useEffect } from 'react'
import { reportWebVitals } from '@/lib/vitals'

export function WebVitals() {
  useEffect(() => {
    reportWebVitals()
  }, [])

  return null
}
```

---

## 🔍 UPTIME MONITORING

### **UptimeRobot Setup**

#### 1. Create Monitors
- **App**: https://app.olcan.com
- **Site**: https://olcan.com
- **API**: https://api.olcan.com/api/v1/health

#### 2. Configure Alerts
- Email notifications
- Slack/Discord webhooks
- SMS for critical services

#### 3. Status Page
Create public status page at status.olcan.com

---

## 📊 CUSTOM DASHBOARDS

### **Grafana Dashboard**

#### Metrics to Track
```yaml
# Application Metrics
- Total Users
- Active Users (DAU/MAU)
- New Signups
- Companion Creations
- Care Activities
- Guild Memberships
- Marketplace Transactions

# Performance Metrics
- Page Load Time
- API Response Time
- Error Rate
- Success Rate
- Database Query Time

# Business Metrics
- Conversion Rate
- Retention Rate
- Churn Rate
- Revenue (if applicable)
```

---

## 🎯 KEY METRICS TO MONITOR

### **Application Health**
- **Error Rate**: < 1%
- **API Response Time**: < 200ms (p95)
- **Page Load Time**: < 3s
- **Uptime**: > 99.9%

### **User Engagement**
- **Daily Active Users (DAU)**
- **Monthly Active Users (MAU)**
- **Session Duration**
- **Pages per Session**
- **Bounce Rate**: < 40%

### **Feature Adoption**
- **Companion Creation Rate**
- **Care Activity Frequency**
- **Guild Participation**
- **Marketplace Conversion**

---

## 🚨 ALERTING RULES

### **Critical Alerts** (Immediate Response)
- API downtime > 1 minute
- Error rate > 5%
- Database connection failures
- Payment processing failures

### **Warning Alerts** (Monitor Closely)
- Error rate > 1%
- Response time > 500ms (p95)
- Disk space > 80%
- Memory usage > 80%

### **Info Alerts** (Review Daily)
- New user signups
- Feature usage patterns
- Performance degradation

---

## 📱 MOBILE APP ANALYTICS (Future)

### **Firebase Analytics**
```typescript
import analytics from '@react-native-firebase/analytics'

// Screen tracking
await analytics().logScreenView({
  screen_name: 'Companion',
  screen_class: 'CompanionScreen',
})

// Event tracking
await analytics().logEvent('companion_created', {
  archetype: 'Soberania',
  level: 1,
})
```

---

## 🔐 SECURITY MONITORING

### **Track Security Events**
```typescript
// Failed login attempts
Sentry.captureMessage('Failed login attempt', {
  level: 'warning',
  tags: { security: 'auth' },
  extra: { email, ipAddress },
})

// Suspicious activity
Sentry.captureMessage('Suspicious activity detected', {
  level: 'error',
  tags: { security: 'threat' },
  extra: { userId, action, timestamp },
})
```

---

## 📊 REPORTING

### **Weekly Reports**
- User growth
- Feature adoption
- Error summary
- Performance metrics

### **Monthly Reports**
- Business metrics
- User retention
- Revenue (if applicable)
- Feature roadmap progress

### **Quarterly Reports**
- Strategic goals
- Major milestones
- Technical debt
- Infrastructure costs

---

## 🛠️ TOOLS STACK

### **Recommended Tools**
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics 4
- **Uptime**: UptimeRobot
- **Performance**: Vercel Analytics / Lighthouse CI
- **Logs**: Datadog / Logtail
- **APM**: New Relic / Datadog
- **Status Page**: Statuspage.io

---

## ✅ MONITORING CHECKLIST

### **Setup**
- [ ] Sentry configured
- [ ] Google Analytics configured
- [ ] Web Vitals tracking enabled
- [ ] Uptime monitors created
- [ ] Alert rules configured
- [ ] Dashboard created
- [ ] Team access granted

### **Testing**
- [ ] Test error tracking
- [ ] Test event tracking
- [ ] Test page view tracking
- [ ] Test alerts
- [ ] Verify data in dashboards

### **Documentation**
- [ ] Document metrics
- [ ] Document alert procedures
- [ ] Document dashboard access
- [ ] Train team on tools

---

## 📈 SUCCESS METRICS

### **Month 1**
- Error rate < 2%
- Uptime > 99%
- All monitoring tools configured

### **Month 3**
- Error rate < 1%
- Uptime > 99.5%
- Performance optimizations based on data

### **Month 6**
- Error rate < 0.5%
- Uptime > 99.9%
- Predictive monitoring in place

---

**Implementation Time**: 4-6 hours  
**Ongoing**: Daily monitoring, weekly reviews  
**Cost**: ~$50-200/month (depending on scale)

📊 **Monitoring and analytics ready for production!**
