// Accounting Database Configuration
// Separate Firebase Instance for Accounting Module

import { initializeApp } from 'firebase/app';
// Auth not needed - we use main app's auth
// import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
// Analytics disabled to avoid 403 errors
// import { getAnalytics } from 'firebase/analytics';

// Accounting System Firebase Configuration
// This is a separate database instance for accounting data
const accountingFirebaseConfig = {
  apiKey: import.meta.env.VITE_ACCOUNTING_FIREBASE_API_KEY || "AIzaSyD6QTiAtCMPtVO60xHNfako9RMEy6WNtIQ",
  authDomain: import.meta.env.VITE_ACCOUNTING_FIREBASE_AUTH_DOMAIN || "sms-accounting-system.firebaseapp.com",
  databaseURL: import.meta.env.VITE_ACCOUNTING_FIREBASE_DATABASE_URL || "https://sms-accounting-system-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_ACCOUNTING_FIREBASE_PROJECT_ID || "sms-accounting-system",
  storageBucket: import.meta.env.VITE_ACCOUNTING_FIREBASE_STORAGE_BUCKET || "sms-accounting-system.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_ACCOUNTING_FIREBASE_MESSAGING_SENDER_ID || "709243032978",
  appId: import.meta.env.VITE_ACCOUNTING_FIREBASE_APP_ID || "1:709243032978:web:44e94c6d172413e0431d4b",
  measurementId: import.meta.env.VITE_ACCOUNTING_FIREBASE_MEASUREMENT_ID || "G-HPQ18CBRWE"
};

// Initialize Accounting Firebase App with error handling
let accountingApp = null;
// Auth not needed - we use main app's auth (shared authentication)
let accountingDatabase = null;
let accountingStorage = null;
let accountingConfigured = false;

try {
  accountingApp = initializeApp(accountingFirebaseConfig, 'AccountingApp');
  // Only initialize database and storage, not auth
  accountingDatabase = getDatabase(accountingApp);
  accountingStorage = getStorage(accountingApp);
  accountingConfigured = true;
  console.log('✅ Accounting database configured successfully');
} catch (error) {
  console.warn('⚠️ Accounting database not configured:', error.message);
  console.warn('Accounting features will be disabled. Configure .env file to enable.');
}

export { accountingDatabase, accountingStorage, accountingConfigured };
export default accountingApp;
