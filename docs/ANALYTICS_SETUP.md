# Analytics Setup Guide - GA4 + GTM + Facebook Pixel

## Overview

This application integrates Google Tag Manager (GTM), Google Analytics 4 (GA4), and Facebook Pixel for comprehensive event tracking and marketing analytics.

## What's Already Implemented

### 1. GTM Container Code
- GTM snippet added to `client/index.html` (head and body sections)
- Default GTM ID: `GTM-XXXXXXX` (replace with your actual ID)
- Content Security Policy updated to allow GTM and Facebook Pixel scripts

### 2. Analytics Utility (`client/src/lib/analytics.ts`)
Centralized tracking functions for all events:
- `trackToolUsed()` - Track calculator/tool usage
- `trackShareClicked()` - Track share button clicks
- `trackConversionSignup()` - Track user registrations
- `trackCtaClick()` - Track call-to-action button clicks
- `trackPageView()` - Track SPA page views
- `trackCustomEvent()` - Track any custom event

### 3. Automatic Page View Tracking
- Integrated in `client/src/App.tsx` via `PageViewTracker` component
- Automatically tracks all route changes in the SPA
- Sends both to GTM and Facebook Pixel

### 4. Event Tracking Implementations
Currently tracking:
- **Tool Usage**: Loan Calculator (example implementation)
- **Share Actions**: ShareResultsButton component
- **Signups**: Email and Google OAuth signup
- **Page Views**: All route changes

## Setup Instructions

### Step 1: Get Your GTM Container ID

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Create a new container or use existing one
3. Copy your Container ID (format: `GTM-XXXXXXX`)

### Step 2: Get Your GA4 Measurement ID (Optional)

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property or use existing one
3. Copy your Measurement ID (format: `G-XXXXXXXXXX`)

### Step 3: Get Your Facebook Pixel ID (Optional, for Ad Campaigns)

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager/)
2. Create a new pixel or use existing one
3. Copy your Pixel ID (numeric, e.g., `1234567890`)

### Step 4: Configure Environment Variables

Add these to your Replit Secrets or create a `.env` file in the `client/` directory:

```bash
# Required - Your GTM Container ID (will be automatically injected into HTML at build time)
VITE_GTM_ID=GTM-YOUR-ACTUAL-ID

# Optional - For Facebook Pixel tracking (initialized automatically if set)
VITE_FB_PIXEL_ID=1234567890

# Optional - For direct GA4 tracking (can also be configured via GTM)
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

**How it works:**
- The Vite build process automatically injects `VITE_GTM_ID` into `client/index.html` at build time
- A custom Vite plugin replaces `GTM-XXXXXXX` placeholder with your actual GTM ID
- Facebook Pixel is initialized from `VITE_FB_PIXEL_ID` when the app loads
- If `VITE_GTM_ID` is not set, the build will show a warning but still work (with placeholder ID)

**Alternative (Manual Configuration):**

If you prefer not to use environment variables, you can manually edit `client/index.html` and replace `GTM-XXXXXXX` with your actual GTM ID in two locations:

```html
<!-- Line ~13: GTM script -->
})(window,document,'script','dataLayer','GTM-YOUR-ACTUAL-ID');

<!-- Line ~153: GTM noscript -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-YOUR-ACTUAL-ID"
```

When you run the development server or build the app, you should see console output:
```
✓ GTM ID configured: GTM-ABC123
```

Or if not configured:
```
⚠️  GTM ID not configured!
Set VITE_GTM_ID environment variable or update client/index.html manually
Example: export VITE_GTM_ID=GTM-ABC123
```

### Step 5: Configure GTM Container

In your GTM dashboard, set up these components:

#### A. Create Variables

1. **Page Path Variable**
   - Type: Data Layer Variable
   - Name: `DL - Page Path`
   - Data Layer Variable Name: `page_path`

2. **Tool Name Variable**
   - Type: Data Layer Variable
   - Name: `DL - Tool Name`
   - Data Layer Variable Name: `tool_name`

3. **CTA Name Variable**
   - Type: Data Layer Variable
   - Name: `DL - CTA Name`
   - Data Layer Variable Name: `cta_name`

#### B. Create Triggers

1. **Page View Trigger**
   - Type: Custom Event
   - Event Name: `pageview`
   - Fires On: All Custom Events

2. **Tool Used Trigger**
   - Type: Custom Event
   - Event Name: `tool_used`
   - Fires On: All Custom Events

3. **Share Clicked Trigger**
   - Type: Custom Event
   - Event Name: `share_clicked`
   - Fires On: All Custom Events

4. **Conversion Signup Trigger**
   - Type: Custom Event
   - Event Name: `conversion_signup`
   - Fires On: All Custom Events

5. **CTA Click Trigger**
   - Type: Custom Event
   - Event Name: `cta_click`
   - Fires On: All Custom Events

#### C. Create GA4 Configuration Tag

1. **GA4 Configuration**
   - Tag Type: Google Analytics: GA4 Configuration
   - Measurement ID: `{{VITE_GA4_MEASUREMENT_ID}}`
   - Trigger: All Pages

#### D. Create GA4 Event Tags

1. **GA4 Event - Page View**
   - Tag Type: Google Analytics: GA4 Event
   - Configuration Tag: `{{GA4 Configuration}}`
   - Event Name: `page_view`
   - Event Parameters:
     - `page_path`: `{{DL - Page Path}}`
   - Trigger: Page View Trigger

2. **GA4 Event - Tool Used**
   - Tag Type: Google Analytics: GA4 Event
   - Configuration Tag: `{{GA4 Configuration}}`
   - Event Name: `tool_used`
   - Event Parameters:
     - `tool_name`: `{{DL - Tool Name}}`
     - `tool_category`: `{{DL - Tool Category}}`
   - Trigger: Tool Used Trigger

3. **GA4 Event - Share Clicked**
   - Tag Type: Google Analytics: GA4 Event
   - Configuration Tag: `{{GA4 Configuration}}`
   - Event Name: `share`
   - Event Parameters:
     - `method`: `{{DL - Share Method}}`
     - `content_type`: `tool`
   - Trigger: Share Clicked Trigger

4. **GA4 Event - Signup**
   - Tag Type: Google Analytics: GA4 Event
   - Configuration Tag: `{{GA4 Configuration}}`
   - Event Name: `sign_up`
   - Event Parameters:
     - `method`: `{{DL - Signup Method}}`
   - Trigger: Conversion Signup Trigger

#### E. Create Facebook Pixel Tags (Optional)

1. **Facebook Pixel Base Code**
   - Tag Type: Custom HTML
   - HTML:
   ```html
   <script>
     !function(f,b,e,v,n,t,s)
     {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
     n.callMethod.apply(n,arguments):n.queue.push(arguments)};
     if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
     n.queue=[];t=b.createElement(e);t.async=!0;
     t.src=v;s=b.getElementsByTagName(e)[0];
     s.parentNode.insertBefore(t,s)}(window, document,'script',
     'https://connect.facebook.net/en_US/fbevents.js');
     fbq('init', 'YOUR_PIXEL_ID');
     fbq('track', 'PageView');
   </script>
   ```
   - Trigger: All Pages

2. **Facebook Pixel - Tool Used**
   - Tag Type: Custom HTML
   - HTML:
   ```html
   <script>
     fbq('track', 'ViewContent', {
       content_name: {{DL - Tool Name}},
       content_category: {{DL - Tool Category}},
       content_type: 'tool'
     });
   </script>
   ```
   - Trigger: Tool Used Trigger

3. **Facebook Pixel - Signup**
   - Tag Type: Custom HTML
   - HTML:
   ```html
   <script>
     fbq('track', 'CompleteRegistration', {
       method: {{DL - Signup Method}},
       status: 'completed'
     });
   </script>
   ```
   - Trigger: Conversion Signup Trigger

### Step 7: Test Your Setup

1. **Enable GTM Preview Mode**
   - In GTM, click "Preview" button
   - Navigate to your website
   - GTM Preview window will open

2. **Test Each Event**
   - Navigate pages → Check for `pageview` events
   - Use a calculator → Check for `tool_used` events
   - Click share button → Check for `share_clicked` events
   - Sign up → Check for `conversion_signup` events

3. **Use Browser DevTools**
   - Open Console
   - Look for `[Analytics] Event tracked:` logs
   - Verify event data structure

4. **Facebook Pixel Helper (Chrome Extension)**
   - Install [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/)
   - Check for green checkmarks on each page
   - Verify events fire correctly

5. **GA4 DebugView**
   - Go to GA4 → Configure → DebugView
   - Events should appear in real-time (may take 1-2 minutes)

## Adding Tracking to New Tools

### Example: Add tracking to BMI Calculator

```typescript
import { trackToolUsed } from '@/lib/analytics';

const calculateBMI = () => {
  // ... your calculation logic ...
  
  // Track tool usage
  trackToolUsed('BMI Calculator', 'Health', {
    height_cm: height,
    weight_kg: weight,
    bmi_result: bmiValue,
    category: bmiCategory
  });
  
  // ... rest of your code ...
};
```

### Example: Add tracking to CTA buttons

```typescript
import { trackCtaClick } from '@/lib/analytics';

<Button 
  onClick={() => {
    trackCtaClick(
      'Start Free Trial',           // CTA name
      'homepage_hero',               // Location
      '/signup'                      // Destination
    );
    navigate('/signup');
  }}
>
  Start Free Trial
</Button>
```

## Events Tracked

| Event Name | When It Fires | Data Sent |
|------------|--------------|-----------|
| `pageview` | On route change | `page_path`, `page_title` |
| `tool_used` | When calculator is used | `tool_name`, `tool_category`, custom params |
| `share_clicked` | Share button clicked | `tool_name`, `share_method`, `success` |
| `conversion_signup` | User registers | `signup_method` (email/google) |
| `cta_click` | CTA button clicked | `cta_name`, `cta_location`, `cta_destination` |

## Troubleshooting

### Events not appearing in GTM Preview?
- Check browser console for `[Analytics] Event tracked:` logs
- Verify `window.dataLayer` exists in console
- Check Content Security Policy allows GTM scripts

### Facebook Pixel not firing?
- Verify Pixel ID is correct
- Check browser ad blockers are disabled
- Use Facebook Pixel Helper Chrome extension

### GA4 events not in DebugView?
- Wait 1-2 minutes for events to appear
- Verify GA4 Measurement ID is correct
- Check GTM tags are firing in Preview mode

## Privacy & GDPR Compliance

⚠️ **Important**: Before deploying to production, implement:

1. **Cookie Consent Banner**
   - Get user consent before loading GTM/Pixel
   - Store consent preferences

2. **GTM Consent Mode**
   ```javascript
   window.dataLayer = window.dataLayer || [];
   function gtag(){dataLayer.push(arguments);}
   gtag('consent', 'default', {
     'analytics_storage': 'denied',
     'ad_storage': 'denied'
   });
   // Update after user consents
   gtag('consent', 'update', {
     'analytics_storage': 'granted',
     'ad_storage': 'granted'
   });
   ```

3. **Privacy Policy Updates**
   - Disclose use of cookies and analytics
   - Explain data collection practices
   - Provide opt-out instructions

## Support

For questions or issues with analytics setup:
- Check GTM/GA4 official documentation
- Review browser console for error messages
- Test in GTM Preview mode first before publishing

## Next Steps

After setup is complete:
1. ✅ Add tracking to remaining calculators (see loan-calculator.tsx as example)
2. ✅ Identify and track additional CTA buttons throughout the site
3. ✅ Set up Custom Conversions in Facebook Ads Manager
4. ✅ Create GA4 Custom Reports for tool usage insights
5. ✅ Implement cookie consent banner for GDPR compliance
