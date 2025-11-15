# Firestore Setup Guide

## Quick Setup (2 minutes)

### Option 1: Using Firebase Console (Recommended for beginners)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: "dapsiwow"
3. **Create Firestore Database**:
   - Click "Firestore Database" in left sidebar
   - Click "Create database"
   - Choose "Start in production mode"
   - Select your preferred region
   - Click "Enable"

4. **Deploy Rules & Indexes**:
   - Install Firebase CLI: `npm install -g firebase-tools`
   - Login: `firebase login`
   - Initialize (in this project folder): `firebase init firestore`
     - Select your project
     - Accept default files (firestore.rules, firestore.indexes.json)
   - Deploy: `firebase deploy --only firestore`

### Option 2: Manual Setup in Console

**Security Rules:**
1. Go to Firestore Database → Rules tab
2. Copy and paste the rules from `firestore.rules`
3. Click "Publish"

**Indexes:**
1. Go to Firestore Database → Indexes tab
2. Create composite index:
   - Collection: `calculationHistory`
   - Fields: `userId` (Ascending), `timestamp` (Descending)
3. Create another index:
   - Collection: `calculationHistory`
   - Fields: `userId` (Ascending), `toolName` (Ascending), `timestamp` (Descending)

## Verification

After setup, test by:
1. Login to your app
2. Calculate a loan
3. Check Profile → History tab
4. Your calculation should appear!

## Files Created

- `firestore.rules` - Security rules for data protection
- `firestore.indexes.json` - Database indexes for fast queries
- `firebase.json` - Firebase configuration
