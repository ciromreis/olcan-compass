/**
 * Google Analytics 4 Integration
 * Tracks user behavior, conversions, and marketing performance
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export type EventName = 
  | 'page_view'
  | 'scroll_depth'
  | 'newsletter_signup'
  | 'resource_download'
  | 'product_view'
  | 'case_study_read'
  | 'video_play'
  | 'faq_expand'
  | 'consultation_request'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'enrollment_complete'
  | 'course_progress'
  | 'referral_sent'
  | 'experiment_view';

export interface EventParameters {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track custom event in Google Analytics
 */
export const trackEvent = (
  eventName: EventName,
  parameters?: EventParameters
): void => {
  if (typeof window === 'undefined') return;
  
  if (window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      timestamp: new Date().toISOString(),
    });
  }

  // Also log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', eventName, parameters);
  }
};

/**
 * Track page view
 */
export const trackPageView = (url: string, title: string): void => {
  trackEvent('page_view', {
    page_location: url,
    page_title: title,
  });
};

/**
 * Track scroll depth
 */
export const trackScrollDepth = (depth: 25 | 50 | 75 | 100): void => {
  trackEvent('scroll_depth', {
    scroll_percentage: depth,
  });
};

/**
 * Track newsletter signup
 */
export const trackNewsletterSignup = (source: string): void => {
  trackEvent('newsletter_signup', {
    source,
    conversion_type: 'lead',
  });
};

/**
 * Track resource download
 */
export const trackResourceDownload = (
  resourceName: string,
  resourceType: string
): void => {
  trackEvent('resource_download', {
    resource_name: resourceName,
    resource_type: resourceType,
    conversion_type: 'lead',
  });
};

/**
 * Track product view
 */
export const trackProductView = (
  productName: string,
  productCategory: string,
  productPrice?: number
): void => {
  trackEvent('product_view', {
    product_name: productName,
    product_category: productCategory,
    product_price: productPrice,
  });
};

/**
 * Track case study engagement
 */
export const trackCaseStudyRead = (
  studentName: string,
  completionPercentage: number
): void => {
  trackEvent('case_study_read', {
    student_name: studentName,
    completion_percentage: completionPercentage,
  });
};

/**
 * Track video play
 */
export const trackVideoPlay = (
  videoTitle: string,
  videoType: 'testimonial' | 'course_preview' | 'webinar'
): void => {
  trackEvent('video_play', {
    video_title: videoTitle,
    video_type: videoType,
  });
};

/**
 * Track FAQ expansion
 */
export const trackFAQExpand = (question: string): void => {
  trackEvent('faq_expand', {
    question,
  });
};

/**
 * Track consultation request
 */
export const trackConsultationRequest = (
  productInterest: string,
  source: string
): void => {
  trackEvent('consultation_request', {
    product_interest: productInterest,
    source,
    conversion_type: 'sql',
  });
};

/**
 * Track add to cart
 */
export const trackAddToCart = (
  productName: string,
  productPrice: number,
  currency: string = 'BRL'
): void => {
  trackEvent('add_to_cart', {
    product_name: productName,
    value: productPrice,
    currency,
  });
};

/**
 * Track checkout begin
 */
export const trackBeginCheckout = (
  productName: string,
  productPrice: number,
  currency: string = 'BRL'
): void => {
  trackEvent('begin_checkout', {
    product_name: productName,
    value: productPrice,
    currency,
  });
};

/**
 * Track purchase
 */
export const trackPurchase = (
  transactionId: string,
  productName: string,
  productPrice: number,
  currency: string = 'BRL'
): void => {
  trackEvent('purchase', {
    transaction_id: transactionId,
    product_name: productName,
    value: productPrice,
    currency,
    conversion_type: 'customer',
  });
};

/**
 * Track enrollment complete
 */
export const trackEnrollmentComplete = (
  courseName: string,
  enrollmentType: 'full' | 'trial'
): void => {
  trackEvent('enrollment_complete', {
    course_name: courseName,
    enrollment_type: enrollmentType,
    conversion_type: 'customer',
  });
};

/**
 * Track course progress
 */
export const trackCourseProgress = (
  courseName: string,
  lessonNumber: number,
  completionPercentage: number
): void => {
  trackEvent('course_progress', {
    course_name: courseName,
    lesson_number: lessonNumber,
    completion_percentage: completionPercentage,
  });
};

/**
 * Track referral sent
 */
export const trackReferralSent = (referralMethod: 'email' | 'link' | 'social'): void => {
  trackEvent('referral_sent', {
    referral_method: referralMethod,
  });
};

/**
 * Track A/B test experiment view
 */
export const trackExperimentView = (
  experimentId: string,
  variant: 'A' | 'B'
): void => {
  trackEvent('experiment_view', {
    experiment_id: experimentId,
    variant,
  });
};

/**
 * Set user properties
 */
export const setUserProperties = (properties: {
  user_id?: string;
  user_type?: 'visitor' | 'lead' | 'customer';
  subscription_status?: 'active' | 'inactive' | 'trial';
  [key: string]: any;
}): void => {
  if (typeof window === 'undefined') return;

  if (window.gtag) {
    window.gtag('set', 'user_properties', properties);
  }
};

/**
 * Initialize scroll depth tracking
 */
export const initScrollTracking = (): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const scrollDepths = [25, 50, 75, 100];
  const tracked = new Set<number>();

  const handleScroll = () => {
    const scrollPercentage = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );

    scrollDepths.forEach((depth) => {
      if (scrollPercentage >= depth && !tracked.has(depth)) {
        tracked.add(depth);
        trackScrollDepth(depth as 25 | 50 | 75 | 100);
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};
