# Calculation History Testing Guide

## Prerequisites ✅
- ✅ Firebase credentials configured (DONE)
- ✅ Code implementation complete (DONE)
- ⏳ Firestore database setup (see FIRESTORE_SETUP.md)

## Complete Testing Process

### Step 1: Deploy Firestore Rules & Indexes

Before testing, you MUST deploy the Firestore configuration:

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firestore (select your project when prompted)
firebase init firestore

# Deploy rules and indexes
firebase deploy --only firestore
```

**Alternative**: Manual setup via Firebase Console (see FIRESTORE_SETUP.md)

### Step 2: Test Saving Loan Calculation History

1. **Login to your app** (click "Login" in top right)
   - If you don't have an account, click "Sign Up"
   
2. **Navigate to Loan Calculator**:
   - Click "Finance Tools" → "Loan Calculator"
   - Or go directly to: `/loan-calculator`

3. **Enter loan details**:
   - Loan Amount: $50,000
   - Interest Rate: 5.5%
   - Loan Term: 5 years
   - Click "Calculate Loan"

4. **Verify calculation completes**:
   - You should see results displayed
   - Check browser console (F12) - should NOT see any errors
   - Look for: "Firebase initialized in development mode"

### Step 3: Check History Shows on Profile

1. **Go to Profile page**:
   - Click your profile icon/name in top right
   - Or go directly to: `/profile`

2. **Click "History" tab**

3. **Expected Result**:
   - ✅ Your loan calculation should appear
   - ✅ Shows "Loan Calculator" with timestamp
   - ✅ Shows key inputs (Loan Amount, Interest Rate, Loan Term)
   - ✅ Shows results (Monthly Payment, Total Amount, etc.)

4. **If empty**:
   - Check browser console for errors
   - Verify Firestore rules are deployed
   - Check Firebase Console → Firestore Database → Data
   - Look for "calculationHistory" collection

### Step 4: Test Removing Individual Calculation

1. **In Profile → History tab**:
   - Find a calculation
   - Click the trash icon (🗑️) on the right
   - Confirm deletion in dialog

2. **Expected Result**:
   - ✅ Calculation disappears immediately
   - ✅ Toast notification: "Deleted"
   - ✅ Refresh page - calculation stays deleted

### Step 5: Test Clearing All History

1. **In Profile → History tab**:
   - Click "Clear All" button (top right)
   - Confirm in dialog

2. **Expected Result**:
   - ✅ All calculations disappear
   - ✅ Shows "No Calculation History" empty state
   - ✅ Toast notification: "History Cleared"

### Step 6: Test Multiple Calculators

Try other calculators to verify they also save:

1. **Mortgage Calculator**:
   - Finance Tools → Mortgage Calculator
   - Enter values and calculate
   - Check Profile → History

2. **Expected**: Both loan and mortgage calculations appear

## Troubleshooting

### Issue: No calculations appearing

**Check 1: Browser Console**
```
F12 → Console tab
Look for errors related to Firestore
```

**Check 2: Firestore Rules**
```bash
firebase deploy --only firestore:rules
```

**Check 3: Firestore Indexes**
```bash
firebase deploy --only firestore:indexes
```

**Check 4: Firebase Console**
- Go to: https://console.firebase.google.com/
- Select your project
- Firestore Database → Data
- Check if "calculationHistory" collection exists

### Issue: "Permission denied" errors

**Solution**: Deploy security rules
```bash
firebase deploy --only firestore:rules
```

### Issue: "Index required" errors

**Solution**: Deploy indexes or create them automatically
```bash
firebase deploy --only firestore:indexes
```

Or click the link in the error message to create the index automatically.

## Success Criteria ✅

- ✅ Calculations save automatically when logged in
- ✅ History displays in Profile → History tab
- ✅ Can delete individual calculations
- ✅ Can clear all history
- ✅ No console errors
- ✅ Data persists after page refresh

## Browser Console Verification

Open browser console (F12) and look for:
```
Firebase initialized in development mode
Auth domain: dapsiwow.firebaseapp.com
Authentication: enabled
```

No errors should appear when:
- Performing calculations
- Loading history
- Deleting calculations

## Files Reference

- `client/src/lib/firebase.ts` - Firebase configuration
- `client/src/lib/calculationHistory.ts` - History service
- `client/src/pages/loan-calculator.tsx` - Saves on calculate
- `client/src/pages/mortgage-calculator.tsx` - Saves on calculate
- `client/src/pages/profile.tsx` - Displays history
- `firestore.rules` - Security rules
- `firestore.indexes.json` - Database indexes
