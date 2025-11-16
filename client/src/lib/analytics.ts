/**
 * Analytics Utility for GA4 + GTM Integration
 * Tracks user events and sends them to Google Analytics via GTM dataLayer
 * Also supports Facebook Pixel integration for ad campaigns
 */

// Initialize dataLayer if it doesn't exist
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}

/**
 * Push event to GTM dataLayer
 * This is the core function that sends all events to GTM
 */
const pushToDataLayer = (data: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(data);
    console.log('[Analytics] Event tracked:', data);
  }
};

/**
 * Track when a user uses a tool/calculator
 * @param toolName - Name of the tool being used (e.g., "Loan Calculator", "BMI Calculator")
 * @param toolCategory - Category of the tool (e.g., "Finance", "Health", "Text")
 * @param additionalParams - Any additional parameters to track
 */
export const trackToolUsed = (
  toolName: string,
  toolCategory?: string,
  additionalParams?: Record<string, any>
) => {
  const eventData = {
    event: 'tool_used',
    tool_name: toolName,
    tool_category: toolCategory || 'Uncategorized',
    timestamp: new Date().toISOString(),
    ...additionalParams,
  };

  pushToDataLayer(eventData);

  // Also track to Facebook Pixel if available
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: toolName,
      content_category: toolCategory,
      content_type: 'tool',
    });
  }
};

/**
 * Track when a user clicks the share button
 * @param toolName - Name of the tool being shared
 * @param shareMethod - Method of sharing (e.g., "native", "clipboard", "social")
 * @param additionalParams - Any additional parameters to track
 */
export const trackShareClicked = (
  toolName: string,
  shareMethod: string = 'clipboard',
  additionalParams?: Record<string, any>
) => {
  const eventData = {
    event: 'share_clicked',
    tool_name: toolName,
    share_method: shareMethod,
    timestamp: new Date().toISOString(),
    ...additionalParams,
  };

  pushToDataLayer(eventData);

  // Also track to Facebook Pixel if available
  if (window.fbq) {
    window.fbq('track', 'Share', {
      content_name: toolName,
      method: shareMethod,
    });
  }
};

/**
 * Track successful user signup/registration
 * @param method - Signup method (e.g., "email", "google", "facebook")
 * @param additionalParams - Any additional parameters to track
 */
export const trackConversionSignup = (
  method: string = 'email',
  additionalParams?: Record<string, any>
) => {
  const eventData = {
    event: 'conversion_signup',
    signup_method: method,
    timestamp: new Date().toISOString(),
    ...additionalParams,
  };

  pushToDataLayer(eventData);

  // Also track to Facebook Pixel if available (important for ad campaigns)
  if (window.fbq) {
    window.fbq('track', 'CompleteRegistration', {
      content_name: 'User Signup',
      status: 'completed',
      method: method,
    });
  }
};

/**
 * Track CTA (Call-to-Action) button clicks
 * @param ctaName - Name/text of the CTA button
 * @param ctaLocation - Location where CTA appears (e.g., "homepage_hero", "navbar", "footer")
 * @param ctaDestination - Where the CTA leads to (e.g., "/signup", "/tools/loan-calculator")
 * @param additionalParams - Any additional parameters to track
 */
export const trackCtaClick = (
  ctaName: string,
  ctaLocation: string,
  ctaDestination?: string,
  additionalParams?: Record<string, any>
) => {
  const eventData = {
    event: 'cta_click',
    cta_name: ctaName,
    cta_location: ctaLocation,
    cta_destination: ctaDestination || '',
    timestamp: new Date().toISOString(),
    ...additionalParams,
  };

  pushToDataLayer(eventData);

  // Also track to Facebook Pixel if available
  if (window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: ctaName,
      content_category: ctaLocation,
    });
  }
};

/**
 * Track page views (for SPA navigation)
 * This should be called on route changes
 * @param pagePath - The page path (e.g., "/tools/loan-calculator")
 * @param pageTitle - The page title
 */
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  const eventData = {
    event: 'pageview',
    page_path: pagePath,
    page_title: pageTitle || document.title,
    timestamp: new Date().toISOString(),
  };

  pushToDataLayer(eventData);

  // Also track to Facebook Pixel if available
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
};

/**
 * Track custom events
 * Use this for any custom tracking not covered by the specific functions above
 * @param eventName - Name of the custom event
 * @param eventParams - Parameters for the event
 */
export const trackCustomEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  const eventData = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...eventParams,
  };

  pushToDataLayer(eventData);
};

/**
 * Initialize Facebook Pixel (called from GTM, but can be used as fallback)
 * @param pixelId - Facebook Pixel ID
 */
export const initializeFacebookPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  // Check if fbq already exists
  if (window.fbq) return;

  // Facebook Pixel Code
  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod
        ? n.callMethod.apply(n, arguments)
        : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    'script',
    'https://connect.facebook.net/en_US/fbevents.js'
  );

  window.fbq!('init', pixelId);
  window.fbq!('track', 'PageView');
};

/**
 * Get analytics configuration from environment variables
 */
export const getAnalyticsConfig = () => {
  return {
    gtmId: import.meta.env.VITE_GTM_ID || 'GTM-XXXXXXX',
    fbPixelId: import.meta.env.VITE_FB_PIXEL_ID || '',
    ga4MeasurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID || '',
  };
};

export default {
  trackToolUsed,
  trackShareClicked,
  trackConversionSignup,
  trackCtaClick,
  trackPageView,
  trackCustomEvent,
  initializeFacebookPixel,
  getAnalyticsConfig,
};
