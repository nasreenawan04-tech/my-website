/**
 * TypeScript declarations for analytics and tracking libraries
 */

// Google Tag Manager dataLayer
declare global {
  interface Window {
    dataLayer: Array<Record<string, any>>;
    fbq?: (
      action: 'track' | 'trackCustom' | 'init',
      event: string,
      params?: Record<string, any>
    ) => void;
    _fbq?: any;
  }
}

// Facebook Pixel types
export interface FacebookPixelParams {
  content_name?: string;
  content_category?: string;
  content_type?: string;
  content_ids?: string[];
  contents?: Array<{ id: string; quantity: number }>;
  value?: number;
  currency?: string;
  method?: string;
  status?: string;
}

// GTM Event types
export interface GTMToolUsedEvent {
  event: 'tool_used';
  tool_name: string;
  tool_category?: string;
  timestamp: string;
  [key: string]: any;
}

export interface GTMShareClickedEvent {
  event: 'share_clicked';
  tool_name: string;
  share_method: string;
  timestamp: string;
  [key: string]: any;
}

export interface GTMConversionSignupEvent {
  event: 'conversion_signup';
  signup_method: string;
  timestamp: string;
  [key: string]: any;
}

export interface GTMCtaClickEvent {
  event: 'cta_click';
  cta_name: string;
  cta_location: string;
  cta_destination: string;
  timestamp: string;
  [key: string]: any;
}

export interface GTMPageViewEvent {
  event: 'pageview';
  page_path: string;
  page_title: string;
  timestamp: string;
}

export type GTMEvent =
  | GTMToolUsedEvent
  | GTMShareClickedEvent
  | GTMConversionSignupEvent
  | GTMCtaClickEvent
  | GTMPageViewEvent
  | Record<string, any>;

export {};
