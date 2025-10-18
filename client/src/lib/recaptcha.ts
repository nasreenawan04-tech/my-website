declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6Lc2Me4rAAAAACqhw6CK736uMJcQgYfGdbF_5or5';

export async function executeRecaptcha(action: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.grecaptcha || !window.grecaptcha.enterprise) {
      console.warn('reCAPTCHA not loaded, proceeding without token');
      resolve('');
      return;
    }

    window.grecaptcha.enterprise.ready(async () => {
      try {
        const token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action });
        resolve(token);
      } catch (error) {
        console.error('reCAPTCHA execution failed:', error);
        resolve('');
      }
    });
  });
}
