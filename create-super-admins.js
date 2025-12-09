/**
 * Script to create Super Admin accounts
 * Run this with: node create-super-admins.js
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const superAdmins = [
  {
    email: "homebwoy@school.com",
    password: "admintest90",
    displayName: "Homebwoy Admin"
  },
  {
    email: "eleblununana@school.com",
    password: "NUNANA123",
    displayName: "Nunana Admin"
  }
];

async function createSuperAdmins() {
  console.log('🚀 Creating Super Admin accounts...\n');

  for (const admin of superAdmins) {
    try {
      console.log(`Creating account for ${admin.email}...`);
      
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        admin.email,
        admin.password
      );
      
      const user = userCredential.user;
      console.log(`✅ Auth user created: ${user.uid}`);

      // Create user profile in Realtime Database
      const userRef = ref(db, `users/${user.uid}`);
      await set(userRef, {
        uid: user.uid,
        email: admin.email,
        displayName: admin.displayName,
        role: 'super_admin',
        createdAt: Date.now(),
        lastLogin: Date.now(),
        isActive: true
      });
      
      console.log(`✅ Database profile created with role: super_admin`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${admin.password}`);
      console.log(`   UID: ${user.uid}\n`);
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  Account already exists: ${admin.email}`);
        console.log(`   You can login with the existing credentials\n`);
      } else {
        console.error(`❌ Error creating ${admin.email}:`, error.message, '\n');
      }
    }
  }

  console.log('✨ Super Admin creation complete!');
  console.log('\n📋 Login Credentials:');
  console.log('─────────────────────────────────────');
  superAdmins.forEach((admin, index) => {
    console.log(`\n${index + 1}. ${admin.displayName}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${admin.password}`);
  });
  console.log('\n─────────────────────────────────────');
  console.log('\n🌐 Login at: http://localhost:5174/login');
  
  process.exit(0);
}

createSuperAdmins().catch(console.error);
