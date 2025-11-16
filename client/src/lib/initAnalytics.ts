/**
 * Initialize Facebook Pixel with environment variable
 * This should be called once when the app loads
 */

import { initializeFacebookPixel, getAnalyticsConfig } from './analytics';

export function initializeAnalytics() {
  if (typeof window === 'undefined') return;

  const config = getAnalyticsConfig();

  // Initialize Facebook Pixel if ID is configured
  if (config.fbPixelId && config.fbPixelId !== '') {
    console.log('[Analytics] Initializing Facebook Pixel:', config.fbPixelId);
    initializeFacebookPixel(config.fbPixelId);
  }

  // GTM is initialized via script tag in index.html
  // The GTM ID must be manually updated in client/index.html
  if (config.gtmId && config.gtmId !== 'GTM-XXXXXXX') {
    console.log('[Analytics] GTM initialized:', config.gtmId);
  } else {
    console.warn('[Analytics] GTM ID not configured. Update VITE_GTM_ID in .env and client/index.html');
  }
}
