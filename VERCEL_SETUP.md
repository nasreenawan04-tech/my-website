# Quick Vercel Deployment Checklist

## ✅ Before Deployment

### Step 1: Add Environment Variables to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables
2. Add these 7 variables (for Production, Preview, and Development):

```
VITE_FIREBASE_API_KEY = [Get from Firebase Console]
VITE_FIREBASE_AUTH_DOMAIN = dapsiwow.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = dapsiwow
VITE_FIREBASE_STORAGE_BUCKET = dapsiwow.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 215234393623
VITE_FIREBASE_APP_ID = 1:215234393623:web:aae78956496745b0de0e52
VITE_FIREBASE_MEASUREMENT_ID = G-4ZFMB2DZPK
```

### Step 2: Configure Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/) → dapsiwow project
2. **Enable Authentication:**
   - Authentication → Sign-in method → Enable "Email/Password"
3. **Add Authorized Domains:**
   - Authentication → Settings → Authorized domains
   - Add: `www.dapsiwow.com`, `dapsiwow.com`, `your-app.vercel.app`

### Step 3: Deploy/Redeploy
1. Go to Vercel → Deployments
2. Click Redeploy
3. **Uncheck** "Use existing Build Cache"
4. Click "Redeploy" button

---

## 🔑 Where to Find Firebase API Key

1. [Firebase Console](https://console.firebase.google.com/)
2. Select "dapsiwow" project
3. Settings (gear icon) → Project settings
4. Scroll to "Your apps" → Web app
5. Copy the `apiKey` value from the config

---

## ⚠️ Common Issues & Fixes

| Error | Fix |
|-------|-----|
| `auth/network-request-failed` | Add your domain to Firebase Authorized domains |
| `auth/configuration-not-found` | Enable Email/Password in Firebase Console |
| `auth/api-key-not-valid` | Check environment variables in Vercel, redeploy without cache |
| Build fails | Verify all environment variables are added |

---

## 📋 Files Updated for Deployment

- ✅ `vercel.json` - Updated Content-Security-Policy for Firebase
- ✅ `.env.example` - Template for required environment variables
- ✅ `DEPLOYMENT_GUIDE.md` - Complete deployment documentation
- ✅ `.gitignore` - Already protecting .env files

---

## 🚀 After Successful Deployment

Test these on your live site:
- [ ] Sign up with email/password
- [ ] Login with email/password
- [ ] Logout functionality
- [ ] All tools are accessible
- [ ] No console errors

---

## 📞 Need Help?

See the full deployment guide in `DEPLOYMENT_GUIDE.md`
