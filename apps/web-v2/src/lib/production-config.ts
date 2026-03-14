// Production Configuration & Security
// Enterprise-grade configuration for compass.olcan.com.br

export const PRODUCTION_CONFIG = {
  // Application
  APP_NAME: 'Olcan Compass V2',
  APP_VERSION: '2.0.0',
  APP_URL: 'https://compass.olcan.com.br',
  
  // API
  API_URL: 'https://api.compass.olcan.com.br',
  API_TIMEOUT: 10000,
  API_RETRY_ATTEMPTS: 3,
  
  // Security
  SESSION_TIMEOUT: 3600000, // 1 hour
  TOKEN_REFRESH_THRESHOLD: 300000, // 5 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 900000, // 15 minutes
  
  // Performance
  BUNDLE_ANALYSIS: true,
  PERFORMANCE_MONITORING: true,
  ERROR_TRACKING: true,
  ANALYTICS_TRACKING: true,
  
  // Cache
  CACHE_TTL: 300000, // 5 minutes
  STATIC_CACHE_TTL: 86400000, // 24 hours
  
  // Rate Limiting
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  
  // File Upload
  MAX_FILE_SIZE: 10485760, // 10MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  
  // Features
  ENABLE_AI_FEATURES: true,
  ENABLE_REAL_TIME_COLLABORATION: true,
  ENABLE_ADVANCED_ANALYTICS: true,
  ENABLE_BETA_FEATURES: false,
  
  // Monitoring
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
  ERROR_REPORTING_THRESHOLD: 5,
  PERFORMANCE_SAMPLE_RATE: 0.1, // 10%
  
  // SEO
  DEFAULT_META: {
    title: 'Olcan Compass V2 - Mobility Intelligence Platform',
    description: 'Plataforma completa de inteligência de mobilidade para estudantes internacionais',
    keywords: ['mobility', 'international students', 'education abroad', 'scholarships'],
    author: 'Olcan Compass Team',
    robots: 'index,follow',
    'og:type': 'website',
    'og:site_name': 'Olcan Compass',
    'og:locale': 'pt_BR'
  },
  
  // Social Media
  SOCIAL_LINKS: {
    twitter: 'https://twitter.com/olcancompass',
    linkedin: 'https://linkedin.com/company/olcan-compass',
    instagram: 'https://instagram.com/olcancompass',
    facebook: 'https://facebook.com/olcancompass'
  },
  
  // Support
  SUPPORT_EMAIL: 'support@compass.olcan.com.br',
  SUPPORT_PHONE: '+55-11-9999-9999',
  HELP_CENTER_URL: 'https://help.compass.olcan.com.br',
  
  // Legal
  PRIVACY_POLICY_URL: 'https://compass.olcan.com.br/privacy',
  TERMS_OF_SERVICE_URL: 'https://compass.olcan.com.br/terms',
  COOKIE_POLICY_URL: 'https://compass.olcan.com.br/cookies',
  
  // Development
  DEBUG_MODE: false,
  VERBOSE_LOGGING: false,
  MOCK_APIS: false,
  
  // Micro-SaaS Modules
  MICRO_SAAS_MODULES: {
    'budget-simulator': {
      enabled: true,
      maxCalculations: 50,
      cacheEnabled: true,
      analyticsEnabled: true
    },
    'pitch-lab': {
      enabled: true,
      maxRecordingDuration: 180000, // 3 minutes
      maxFileSize: 52428800, // 50MB
      supportedFormats: ['video/webm', 'video/mp4', 'audio/webm', 'audio/mp3'],
      transcriptionEnabled: true
    },
    'forge-lab': {
      enabled: true,
      maxDocumentSize: 1048576, // 1MB
      maxVersions: 50,
      autoSaveInterval: 30000, // 30 seconds
      aiAnalysisEnabled: true
    },
    'nudge-engine': {
      enabled: true,
      maxNudges: 100,
      personalizationEnabled: true,
      analyticsEnabled: true
    },
    'institutional': {
      enabled: true,
      realTimeUpdates: true,
      exportEnabled: true,
      advancedAnalytics: true
    }
  }
} as const;

// Security utilities
export const SECURITY_CONFIG = {
  // Content Security Policy
  CSP_DIRECTIVES: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
    'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    'font-src': ["'self'", "https://fonts.gstatic.com"],
    'img-src': ["'self'", "data:", "https:", "blob:"],
    'media-src': ["'self'", "blob:"],
    'connect-src': ["'self'", "https://api.compass.olcan.com.br", "https://*.supabase.co"],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': []
  },
  
  // Headers
  SECURITY_HEADERS: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  },
  
  // Rate Limiting Rules
  RATE_LIMIT_RULES: [
    {
      path: '/api/auth/login',
      requests: 5,
      window: 900000, // 15 minutes
      skipSuccessfulRequests: false
    },
    {
      path: '/api/auth/register',
      requests: 3,
      window: 3600000, // 1 hour
      skipSuccessfulRequests: false
    },
    {
      path: '/api/tools/*',
      requests: 100,
      window: 60000, // 1 minute
      skipSuccessfulRequests: true
    },
    {
      path: '/api/*',
      requests: 1000,
      window: 3600000, // 1 hour
      skipSuccessfulRequests: true
    }
  ]
} as const;

// Performance monitoring configuration
export const PERFORMANCE_CONFIG = {
  // Core Web Vitals thresholds
  CORE_WEB_VITALS: {
    LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
    FID: { good: 100, needsImprovement: 300 },   // First Input Delay
    CLS: { good: 0.1, needsImprovement: 0.25 }    // Cumulative Layout Shift
  },
  
  // Custom metrics
  CUSTOM_METRICS: {
    'time-to-interactive': { good: 3000, needsImprovement: 5000 },
    'first-contentful-paint': { good: 1000, needsImprovement: 2000 },
    'bundle-size': { good: 100000, needsImprovement: 250000 }, // bytes
    'api-response-time': { good: 500, needsImprovement: 1000 }  // ms
  },
  
  // Sampling rates
  SAMPLING_RATES: {
    performance: 0.1,    // 10%
    errors: 1.0,         // 100%
    'user-interactions': 0.01, // 1%
    'network-requests': 0.1   // 10%
  },
  
  // Monitoring endpoints
  ENDPOINTS: {
    performance: '/api/analytics/performance',
    errors: '/api/analytics/errors',
    'user-behavior': '/api/analytics/behavior'
  }
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  // Beta features
  BETA_AI_COACH: false,
  BETA_REAL_TIME_COLLABORATION: false,
  BETA_ADVANCED_ANALYTICS: false,
  
  // A/B tests
  AB_TEST_NEW_ONBOARDING: false,
  AB_TEST_IMPROVED_SEARCH: false,
  AB_TEST_ENHANCED_DASHBOARD: false,
  
  // Gradual rollout
  GRADUAL_ROLLOUT_MICRO_SAAS: true,
  GRADUAL_ROLLOUT_INSTITUTIONAL: true,
  GRADUAL_ROLLOUT_AI_FEATURES: true,
  
  // Emergency switches
  EMERGENCY_DISABLE_AI: false,
  EMERGENCY_DISABLE_UPLOADS: false,
  EMERGENCY_DISABLE_ANALYTICS: false,
  EMERGENCY_MAINTENANCE_MODE: false
} as const;

// Environment validation
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_APP_URL'
  ];
  
  required.forEach(envVar => {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  });
  
  // Validate URLs
  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_APP_URL);
    } catch {
      errors.push('Invalid NEXT_PUBLIC_APP_URL format');
    }
  }
  
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_API_URL);
    } catch {
      errors.push('Invalid NEXT_PUBLIC_API_URL format');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Health check function
export async function performHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, { status: 'pass' | 'fail'; message?: string }>;
  timestamp: string;
}> {
  const checks: Record<string, { status: 'pass' | 'fail'; message?: string }> = {};
  
  // Check API connectivity
  try {
    const response = await fetch(`${PRODUCTION_CONFIG.API_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    checks.api = response.ok ? 
      { status: 'pass' } : 
      { status: 'fail', message: `API returned ${response.status}` };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    checks.api = { status: 'fail', message: errorMessage };
  }
  
  // Check Supabase connectivity
  try {
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).supabase) {
      const supabase = (window as unknown as Record<string, unknown>).supabase as { from: (table: string) => { select: (columns: string) => { limit: (count: number) => Promise<{ error?: { message: string } }> } } };
      const { error } = await supabase.from('profiles').select('count').limit(1);
      checks.supabase = error ? 
        { status: 'fail', message: error.message } : 
        { status: 'pass' };
    } else {
      checks.supabase = { status: 'fail', message: 'Supabase client not available' };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Supabase connectivity failed';
    checks.supabase = { status: 'fail', message: errorMessage };
  }
  
  // Check browser compatibility
  if (typeof window !== 'undefined') {
    const requiredFeatures = ['fetch', 'localStorage', 'sessionStorage', 'Promise'];
    const missingFeatures = requiredFeatures.filter(feature => !(feature in window));
    
    checks.browser = missingFeatures.length === 0 ? 
      { status: 'pass' } : 
      { status: 'fail', message: `Missing features: ${missingFeatures.join(', ')}` };
  } else {
    checks.browser = { status: 'fail', message: 'Window object not available' };
  }
  
  // Check storage availability
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('health-check', 'test');
      localStorage.removeItem('health-check');
      checks.storage = { status: 'pass' };
    } catch (error) {
      checks.storage = { status: 'fail', message: 'LocalStorage not available' };
    }
  } else {
    checks.storage = { status: 'fail', message: 'Storage check skipped (SSR)' };
  }
  
  // Determine overall status
  const failedChecks = Object.values(checks).filter(check => check.status === 'fail');
  const status = failedChecks.length === 0 ? 'healthy' : 
                 failedChecks.length <= 2 ? 'degraded' : 'unhealthy';
  
  return {
    status,
    checks,
    timestamp: new Date().toISOString()
  };
}

// Security utilities
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateCSRFToken(token: string): boolean {
  // Implement CSRF token validation logic
  return Boolean(token) && token.length === 64;
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

const productionConfig = {
  PRODUCTION_CONFIG,
  SECURITY_CONFIG,
  PERFORMANCE_CONFIG,
  FEATURE_FLAGS,
  validateEnvironment,
  performHealthCheck,
  generateCSRFToken,
  validateCSRFToken,
  sanitizeInput,
  validateEmail,
  validatePassword
};

export default productionConfig;
