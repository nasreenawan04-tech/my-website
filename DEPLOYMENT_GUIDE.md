# DapsiWow Deployment Guide

## Firebase Setup

### 1. Firebase Console Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **dapsiwow**
3. Enable Authentication:
   - Navigate to **Authentication** → **Sign-in method**
   - Enable **Email/Password** authentication
   - Click **Save**

### 2. Authorize Your Deployment Domain

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Click **Add domain**
3. Add your deployment domains:
   - `www.dapsiwow.com`
   - `dapsiwow.com`
   - `your-app.vercel.app` (if deploying to Vercel)
4. Click **Add** for each domain

---

## Vercel Deployment

### 1. Add Environment Variables in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add the following variables (select Production, Preview, and Development for each):

```
VITE_FIREBASE_API_KEY = [Your Firebase API Key]
VITE_FIREBASE_AUTH_DOMAIN = dapsiwow.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = dapsiwow
VITE_FIREBASE_STORAGE_BUCKET = dapsiwow.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 215234393623
VITE_FIREBASE_APP_ID = 1:215234393623:web:aae78956496745b0de0e52
VITE_FIREBASE_MEASUREMENT_ID = G-4ZFMB2DZPK
```

### 2. Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Option B: Using Vercel Dashboard**
1. Connect your GitHub repository
2. Vercel will auto-detect the build settings
3. Click **Deploy**

### 3. Redeploy After Adding Environment Variables

1. Go to **Deployments** tab
2. Click the three dots on the latest deployment
3. Click **Redeploy**
4. **DO NOT** check "Use existing Build Cache" (to ensure new environment variables are included)

---

## Troubleshooting

### Firebase Authentication Errors

**Error: `auth/network-request-failed`**
- **Cause**: Firebase can't connect from your domain
- **Fix**: Make sure your deployment domain is added to Firebase Authorized domains

**Error: `auth/configuration-not-found`**
- **Cause**: Email/Password authentication is not enabled
- **Fix**: Enable Email/Password in Firebase Console → Authentication → Sign-in method

**Error: `auth/api-key-not-valid`**
- **Cause**: Invalid or missing Firebase API key
- **Fix**: 
  1. Verify your API key in Firebase Console → Project Settings
  2. Make sure environment variables are set correctly in Vercel
  3. Redeploy without using build cache

### Vercel Build Errors

**Error: Missing environment variables**
- Make sure all `VITE_FIREBASE_*` variables are added in Vercel settings
- Redeploy after adding variables

**Error: Page not loading**
- Check that `vercel.json` rewrites are configured correctly
- Verify the build output directory is set to `dist`

---

## Build Configuration

The project uses these build settings (already configured in `vercel.json`):

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: Vite

---

## Security Headers

The following security headers are configured in `vercel.json`:

- X-Frame-Options
- Content-Security-Policy (updated for Firebase)
- Strict-Transport-Security
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

---

## Post-Deployment Checklist

- [ ] All environment variables added to Vercel
- [ ] Firebase Email/Password authentication enabled
- [ ] Deployment domain authorized in Firebase
- [ ] Successfully deployed to Vercel
- [ ] Test signup functionality on live site
- [ ] Test login functionality on live site
- [ ] Verify all tools are working
- [ ] Check that custom domain (www.dapsiwow.com) is connected

---

## Getting Your Firebase API Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **dapsiwow** project
3. Click the gear icon → **Project settings**
4. Scroll down to **Your apps** section
5. Find your web app
6. Copy the values from the `firebaseConfig` object
7. Add these to Vercel environment variables

---

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure Firebase authorized domains include your deployment URL
4. Try redeploying without build cache
