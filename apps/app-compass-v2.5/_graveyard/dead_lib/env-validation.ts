/**
 * Environment Variable Validation
 * Validates required environment variables at build time and runtime
 */

interface EnvConfig {
  // API URLs
  NEXT_PUBLIC_API_URL?: string;
  NEXT_PUBLIC_APP_URL?: string;
  NEXT_PUBLIC_MARKETPLACE_API_URL?: string;
  NEXT_PUBLIC_CMS_URL?: string;
  NEXT_PUBLIC_ZENITH_API_URL?: string;

  // Feature Flags
  NEXT_PUBLIC_DEMO_MODE?: string;
  NEXT_PUBLIC_ENABLE_ANALYTICS?: string;
  NEXT_PUBLIC_APP_VERSION?: string;

  // Authentication (optional)
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;

  // Payments (optional)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
}

/**
 * Required environment variables for production
 */
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_APP_URL',
] as const;

/**
 * Optional but recommended environment variables
 */
const RECOMMENDED_ENV_VARS = [
  'NEXT_PUBLIC_DEMO_MODE',
  'NEXT_PUBLIC_APP_VERSION',
] as const;

/**
 * Validates environment variables
 * @throws Error if required variables are missing
 */
export function validateEnv(): EnvConfig {
  const env = process.env as EnvConfig;
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const key of REQUIRED_ENV_VARS) {
    if (!env[key]) {
      missing.push(key);
    }
  }

  // Check recommended variables
  for (const key of RECOMMENDED_ENV_VARS) {
    if (!env[key]) {
      warnings.push(key);
    }
  }

  // Throw error if required variables are missing
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please check your .env.local or .env.production file.`
    );
  }

  // Log warnings for missing recommended variables
  if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn(
      `⚠️  Missing recommended environment variables:\n${warnings.map(v => `  - ${v}`).join('\n')}`
    );
  }

  return env;
}

/**
 * Gets a validated environment variable
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set
 */
export function getEnv(key: keyof EnvConfig, defaultValue?: string): string {
  const value = process.env[key];
  
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set and no default provided`);
  }
  
  return value || defaultValue || '';
}

/**
 * Checks if running in demo mode
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

/**
 * Checks if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Checks if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Gets the app version
 */
export function getAppVersion(): string {
  return process.env.NEXT_PUBLIC_APP_VERSION || '2.5.0';
}

/**
 * Gets the API URL
 */
export function getApiUrl(): string {
  return getEnv('NEXT_PUBLIC_API_URL', 'http://localhost:8001/api/v1');
}

/**
 * Gets the app URL
 */
export function getAppUrl(): string {
  return getEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
}

// Validate environment on module load (only in production)
if (isProduction() && typeof window === 'undefined') {
  try {
    validateEnv();
    console.log('✅ Environment variables validated successfully');
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    // Don't throw in production to avoid breaking the build
    // The error will be logged and can be caught by monitoring
  }
}
