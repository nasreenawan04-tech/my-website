#!/bin/bash

# Firestore Deployment Script
# This script helps you deploy Firestore rules and indexes to your Firebase project

echo "🔥 Firestore Deployment Helper"
echo "=============================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed"
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Firebase CLI"
        echo "Please install manually: npm install -g firebase-tools"
        exit 1
    fi
    echo "✅ Firebase CLI installed successfully"
fi

echo "🔑 Logging into Firebase..."
firebase login

if [ $? -ne 0 ]; then
    echo "❌ Firebase login failed"
    exit 1
fi

echo "✅ Login successful"
echo ""

# Check if Firebase is already initialized
if [ ! -f ".firebaserc" ]; then
    echo "🔧 Initializing Firebase project..."
    firebase init firestore
    if [ $? -ne 0 ]; then
        echo "❌ Firebase initialization failed"
        exit 1
    fi
else
    echo "✅ Firebase already initialized"
fi

echo ""
echo "🚀 Deploying Firestore rules and indexes..."
firebase deploy --only firestore

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Login to your DapsiWow app"
    echo "2. Go to Loan Calculator and perform a calculation"
    echo "3. Check Profile → History tab"
    echo "4. Your calculation should appear!"
    echo ""
    echo "📖 For detailed testing instructions, see TESTING_GUIDE.md"
else
    echo ""
    echo "❌ Deployment failed"
    echo "Please check the error messages above"
    echo ""
    echo "Common solutions:"
    echo "- Verify your Firebase project exists"
    echo "- Check that you have proper permissions"
    echo "- Ensure firestore.rules and firestore.indexes.json exist"
fi
