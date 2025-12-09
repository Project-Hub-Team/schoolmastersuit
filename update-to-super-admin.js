/**
 * Script to update user roles to Super Admin
 * Run this with: node update-to-super-admin.js
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, update, get } from 'firebase/database';

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

async function updateToSuperAdmin() {
  console.log('🔧 Updating user roles to Super Admin...\n');

  for (const admin of superAdmins) {
    try {
      console.log(`Signing in as ${admin.email}...`);
      
      // Sign in to get the user UID
      const userCredential = await signInWithEmailAndPassword(
        auth,
        admin.email,
        admin.password
      );
      
      const user = userCredential.user;
      console.log(`✅ Signed in successfully: ${user.uid}`);

      // Check current role
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        console.log(`   Current role: ${userData.role || 'not set'}`);
        
        // Update to super_admin
        await update(userRef, {
          role: 'super_admin',
          displayName: admin.displayName,
          isActive: true,
          updatedAt: Date.now()
        });
        
        console.log(`✅ Role updated to: super_admin`);
        console.log(`   Display Name: ${admin.displayName}\n`);
      } else {
        // Create user profile if it doesn't exist
        await update(userRef, {
          uid: user.uid,
          email: admin.email,
          displayName: admin.displayName,
          role: 'super_admin',
          createdAt: Date.now(),
          lastLogin: Date.now(),
          isActive: true
        });
        console.log(`✅ User profile created with role: super_admin\n`);
      }
      
      // Sign out
      await auth.signOut();
      
    } catch (error) {
      console.error(`❌ Error updating ${admin.email}:`, error.message, '\n');
    }
  }

  console.log('✨ Role update complete!');
  console.log('\n📋 Super Admin Login Credentials:');
  console.log('═════════════════════════════════════');
  superAdmins.forEach((admin, index) => {
    console.log(`\n${index + 1}. ${admin.displayName}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${admin.password}`);
    console.log(`   Role: super_admin ✅`);
  });
  console.log('\n═════════════════════════════════════');
  console.log('\n🌐 Login at: http://localhost:5174/login');
  console.log('🎯 After login, you can access Super Admin Dashboard');
  
  process.exit(0);
}

updateToSuperAdmin().catch(console.error);
