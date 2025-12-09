/**
 * Script to verify super admin accounts and their roles
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCRNfY33h_7IiBd33dQvJU6N-Z8_89QdR4",
  authDomain: "school-management-system-afc40.firebaseapp.com",
  databaseURL: "https://school-management-system-afc40-default-rtdb.firebaseio.com",
  projectId: "school-management-system-afc40",
  storageBucket: "school-management-system-afc40.firebasestorage.app",
  messagingSenderId: "820808452188",
  appId: "1:820808452188:web:d6d5cb0e416d93cbf2c2f3",
  measurementId: "G-ZZKSD1DHCL"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function verifyAccounts() {
  console.log('🔍 Verifying Super Admin accounts...\n');
  
  try {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const users = snapshot.val();
      const superAdmins = Object.entries(users).filter(([uid, user]) => user.role === 'super_admin');
      
      console.log(`✅ Found ${superAdmins.length} Super Admin(s):\n`);
      
      superAdmins.forEach(([uid, user]) => {
        console.log('─────────────────────────────────────');
        console.log(`Email: ${user.email}`);
        console.log(`Display Name: ${user.displayName || 'Not set'}`);
        console.log(`Role: ${user.role}`);
        console.log(`UID: ${uid}`);
        console.log(`Active: ${user.isActive ? 'Yes' : 'No'}`);
        console.log('─────────────────────────────────────\n');
      });
      
      if (superAdmins.length === 0) {
        console.log('⚠️  No super admin accounts found!');
        console.log('Run: node update-to-super-admin.js');
      }
    } else {
      console.log('❌ No users found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

verifyAccounts();
