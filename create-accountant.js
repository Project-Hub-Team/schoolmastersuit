/**
 * Create Accountant User Script
 * 
 * This script creates a new accountant user in the Ghana School Management System
 * 
 * Usage:
 * node create-accountant.js
 */

import admin from 'firebase-admin';
import readline from 'readline';
import { readFileSync } from 'fs';

// Initialize Firebase Admin (you'll need to provide your service account key)
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://school-management-system-afc40-default-rtdb.firebaseio.com"
});

const auth = admin.auth();
const db = admin.database();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAccountant() {
  try {
    console.log('\n========================================');
    console.log('Create Accountant User');
    console.log('========================================\n');

    // Get user input
    const email = await question('Enter accountant email: ');
    const password = await question('Enter password (min 6 characters): ');
    const displayName = await question('Enter full name: ');
    const phoneNumber = await question('Enter phone number (optional): ');

    // Validate input
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    if (!displayName || displayName.trim().length === 0) {
      throw new Error('Display name is required');
    }

    console.log('\nCreating Firebase Authentication user...');

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email: email.trim(),
      password: password,
      displayName: displayName.trim(),
      emailVerified: false
    });

    console.log('✓ Firebase Auth user created:', userRecord.uid);

    // Create user profile in database
    console.log('\nCreating user profile in database...');

    const userProfile = {
      uid: userRecord.uid,
      email: email.trim(),
      displayName: displayName.trim(),
      role: 'accountant',
      phoneNumber: phoneNumber.trim() || null,
      isActive: true,
      createdAt: Date.now(),
      createdBy: 'system',
      lastLogin: null,
      metadata: {
        createdVia: 'admin-script',
        department: 'accounting'
      }
    };

    await db.ref(`users/${userRecord.uid}`).set(userProfile);

    console.log('✓ User profile created in database');

    // Create initial accountant settings
    console.log('\nCreating accountant settings...');

    const accountantSettings = {
      uid: userRecord.uid,
      permissions: {
        canApproveExpenses: true,
        canCreateBudgets: true,
        canGenerateReports: true,
        canManageFees: true,
        canViewAuditLogs: true
      },
      preferences: {
        defaultCurrency: 'GHS',
        dateFormat: 'DD/MM/YYYY',
        reportEmailNotifications: true
      },
      createdAt: Date.now()
    };

    await db.ref(`accountants/${userRecord.uid}`).set(accountantSettings);

    console.log('✓ Accountant settings created');

    // Log the creation in audit trail
    console.log('\nCreating audit log...');

    const auditLog = {
      action: 'CREATE_ACCOUNTANT',
      userId: 'system',
      targetUserId: userRecord.uid,
      details: `Created accountant user: ${email}`,
      timestamp: Date.now()
    };

    await db.ref('auditLogs').push(auditLog);

    console.log('✓ Audit log created');

    // Display success message
    console.log('\n========================================');
    console.log('SUCCESS! Accountant user created');
    console.log('========================================');
    console.log('\nUser Details:');
    console.log('  UID:', userRecord.uid);
    console.log('  Email:', email);
    console.log('  Name:', displayName);
    console.log('  Role: accountant');
    console.log('\nLogin Credentials:');
    console.log('  Email:', email);
    console.log('  Password: [as entered]');
    console.log('\nNext Steps:');
    console.log('1. User can now login at the login page');
    console.log('2. User will have access to the accountant dashboard');
    console.log('3. User should change password after first login');
    console.log('4. Initialize database sync after first login');
    console.log('\n========================================\n');

  } catch (error) {
    console.error('\n❌ Error creating accountant:', error.message);
    console.log('\nPlease check:');
    console.log('- Firebase configuration is correct');
    console.log('- Service account key is valid');
    console.log('- Database rules allow write access');
    console.log('- Email is not already in use');
  } finally {
    rl.close();
    process.exit();
  }
}

// Run the script
createAccountant();
