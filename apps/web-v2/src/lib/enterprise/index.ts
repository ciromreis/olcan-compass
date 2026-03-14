// Enterprise Libraries Barrel Export
// Production-ready utilities for compass.olcan.com.br

export { monitor, trackPerformance, usePerformanceTracker } from '../monitoring';
export {
  useDebounce,
  useThrottle,
  useVirtualScrolling,
  useLazyLoad,
  OptimizedImage,
  usePerformanceMonitor,
  dynamicImport,
  useCache,
  networkOptimizer,
  useMemoryOptimizer,
  useSEO,
  useAccessibility
} from '../optimization';
export {
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
} from '../production-config';
