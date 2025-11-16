/**
 * Vite Plugin to inject GTM ID from environment variables into index.html
 * This allows the GTM container ID to be configured via VITE_GTM_ID without manual HTML edits
 * Supports both .env files and process.env
 */

import type { Plugin } from 'vite';

export function injectGTMPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'inject-gtm-id',
    transformIndexHtml(html) {
      // Try to get GTM ID from Vite env (loaded from .env), then fallback to process.env
      const gtmId = env.VITE_GTM_ID || process.env.VITE_GTM_ID || 'GTM-XXXXXXX';
      
      // Only show warning if GTM ID is still placeholder
      if (gtmId === 'GTM-XXXXXXX') {
        console.warn('\n⚠️  GTM ID not configured!');
        console.warn('Set VITE_GTM_ID in .env file or environment variable');
        console.warn('Example: Add to .env file:');
        console.warn('  VITE_GTM_ID=GTM-ABC123\n');
      } else {
        console.log(`✓ GTM ID configured: ${gtmId}`);
      }
      
      // Replace all instances of GTM-XXXXXXX with actual GTM ID
      return html.replace(/GTM-XXXXXXX/g, gtmId);
    },
  };
}
