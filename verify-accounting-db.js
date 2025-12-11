/**
 * Simple Accounting Database Verification
 * Tests connection to accounting database from the client side
 * 
 * Usage: npm run verify-db
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

// Accounting Database Configuration
const accountingConfig = {
  apiKey: "AIzaSyD6QTiAtCMPtVO60xHNfako9RMEy6WNtIQ",
  authDomain: "sms-accounting-system.firebaseapp.com",
  databaseURL: "https://sms-accounting-system-default-rtdb.firebaseio.com",
  projectId: "sms-accounting-system",
  storageBucket: "sms-accounting-system.firebasestorage.app",
  messagingSenderId: "831776398619",
  appId: "1:831776398619:web:e6e7cea8a0a3f7e57bfd0b",
  measurementId: "G-BC49RGPBWP"
};

console.log('\n========================================');
console.log('🔍 Accounting Database Verification');
console.log('========================================\n');

async function verifyConnection() {
  try {
    console.log('📡 Initializing connection to accounting database...');
    const app = initializeApp(accountingConfig, 'AccountingVerification');
    const database = getDatabase(app);
    
    console.log('✅ Firebase app initialized successfully');
    console.log(`📊 Database URL: ${accountingConfig.databaseURL}`);
    console.log(`🏢 Project ID: ${accountingConfig.projectId}\n`);
    
    // Test read access
    console.log('🔍 Testing database read access...');
    const testRef = ref(database, '/');
    const snapshot = await get(testRef);
    
    if (snapshot.exists()) {
      console.log('✅ Database is accessible and contains data');
      const data = snapshot.val();
      const collections = Object.keys(data || {});
      console.log(`📁 Found ${collections.length} collection(s): ${collections.join(', ')}\n`);
    } else {
      console.log('⚠️  Database is accessible but empty (this is OK for a new setup)\n');
    }
    
    console.log('========================================');
    console.log('✅ Verification Complete - Database Ready!');
    console.log('========================================\n');
    
    console.log('Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Login as accountant');
    console.log('3. Check browser console for sync messages\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Verification failed!');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your internet connection');
    console.error('2. Verify Firebase project exists');
    console.error('3. Ensure database URL is correct');
    console.error('4. Check Firebase security rules allow read access\n');
    process.exit(1);
  }
}

verifyConnection();
