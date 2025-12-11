/**
 * Database Sync Utilities
 * Synchronizes data between accounting database and main database
 */

import { ref, get, set, update, onValue, off } from 'firebase/database';
import { database } from '../config/firebase.config';
import { accountingDatabase } from '../config/accounting.firebase.config';
import {
  updateStudentAccountBalance,
  createTransaction
} from './accounting.database';

// ============================================
// SYNC CONFIGURATION
// ============================================

const SYNC_CONFIG = {
  enabled: true,
  syncInterval: 60000, // 1 minute
  retryAttempts: 3,
  retryDelay: 5000 // 5 seconds
};

// ============================================
// STUDENT DATA SYNC
// ============================================

/**
 * Sync student fee data from main database to accounting database
 */
export const syncStudentFeesFromMain = async (studentId) => {
  try {
    // Get student data from main database
    const studentRef = ref(database, `students/${studentId}`);
    const snapshot = await get(studentRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Student not found' };
    }

    const student = snapshot.val();

    // Calculate account balance
    const totalFees = student.fees?.total || 0;
    const totalPaid = student.fees?.paid || 0;
    const balance = totalFees - totalPaid;

    // Update accounting database
    const accountData = {
      studentId,
      studentName: student.name,
      class: student.class,
      totalFees,
      totalPaid,
      balance,
      lastPaymentDate: student.fees?.lastPaymentDate || null,
      transactions: student.fees?.transactions || [],
      updatedAt: Date.now()
    };

    await updateStudentAccountBalance(studentId, accountData);

    return { success: true, data: accountData };
  } catch (error) {
    console.error('Error syncing student fees:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sync all students' fee data
 */
export const syncAllStudentFees = async () => {
  try {
    const studentsRef = ref(database, 'students');
    const snapshot = await get(studentsRef);

    if (!snapshot.exists()) {
      return { success: true, count: 0 };
    }

    let syncCount = 0;
    const syncPromises = [];

    snapshot.forEach((child) => {
      syncPromises.push(syncStudentFeesFromMain(child.key));
      syncCount++;
    });

    await Promise.all(syncPromises);

    return { success: true, count: syncCount };
  } catch (error) {
    console.error('Error syncing all student fees:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update main database when payment is made in accounting system
 */
export const syncPaymentToMainDB = async (studentId, paymentData) => {
  try {
    // Get current student data from main DB
    const studentRef = ref(database, `students/${studentId}`);
    const snapshot = await get(studentRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Student not found' };
    }

    const student = snapshot.val();
    const currentPaid = student.fees?.paid || 0;
    const newPaid = currentPaid + paymentData.amount;
    const total = student.fees?.total || 0;
    const newBalance = total - newPaid;

    // Update main database
    const updates = {
      'fees/paid': newPaid,
      'fees/balance': newBalance,
      'fees/lastPaymentDate': paymentData.date || Date.now(),
      'fees/updatedAt': Date.now()
    };

    await update(studentRef, updates);

    // Add transaction to student's fee history in main DB
    const transactionRef = ref(database, `students/${studentId}/fees/transactions/${paymentData.transactionId}`);
    await set(transactionRef, {
      amount: paymentData.amount,
      date: paymentData.date || Date.now(),
      method: paymentData.method,
      reference: paymentData.reference,
      description: paymentData.description
    });

    return { success: true };
  } catch (error) {
    console.error('Error syncing payment to main DB:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// REAL-TIME SYNC LISTENERS
// ============================================

let studentFeesListener = null;

/**
 * Setup real-time listener for student fee changes in main database
 */
export const setupStudentFeesListener = () => {
  if (!SYNC_CONFIG.enabled) {
    console.log('Database sync is disabled');
    return;
  }

  const studentsRef = ref(database, 'students');

  studentFeesListener = onValue(studentsRef, async (snapshot) => {
    if (snapshot.exists()) {
      console.log('Student data changed, syncing to accounting database...');

      snapshot.forEach(async (child) => {
        const studentId = child.key;
        const student = child.val();

        // Only sync if fee data has changed
        if (student.fees) {
          await syncStudentFeesFromMain(studentId);
        }
      });
    }
  });

  console.log('Student fees real-time sync listener activated');
};

/**
 * Stop real-time listener for student fees
 */
export const stopStudentFeesListener = () => {
  if (studentFeesListener) {
    const studentsRef = ref(database, 'students');
    off(studentsRef, 'value', studentFeesListener);
    studentFeesListener = null;
    console.log('Student fees sync listener stopped');
  }
};

// ============================================
// BIDIRECTIONAL SYNC
// ============================================

/**
 * Sync accounting transaction to main database
 */
export const syncAccountingTransactionToMain = async (transaction) => {
  try {
    // Store transaction reference in main database
    const transactionRef = ref(database, `accounting/transactions/${transaction.id}`);
    await set(transactionRef, {
      ...transaction,
      syncedAt: Date.now()
    });

    // If transaction is related to a student, update student record
    if (transaction.studentId && transaction.type === 'income') {
      await syncPaymentToMainDB(transaction.studentId, {
        amount: transaction.amount,
        date: transaction.createdAt,
        method: transaction.paymentMethod,
        reference: transaction.reference,
        description: transaction.description,
        transactionId: transaction.id
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error syncing transaction to main DB:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sync fee structure changes to main database
 */
export const syncFeeStructureToMain = async (feeStructure) => {
  try {
    const feeRef = ref(database, `accounting/feeStructures/${feeStructure.id}`);
    await set(feeRef, {
      ...feeStructure,
      syncedAt: Date.now()
    });

    return { success: true };
  } catch (error) {
    console.error('Error syncing fee structure to main DB:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// SYNC STATUS & MONITORING
// ============================================

/**
 * Check sync status between databases
 */
export const checkSyncStatus = async () => {
  try {
    const mainStudentsRef = ref(database, 'students');
    const mainSnapshot = await get(mainStudentsRef);

    const accountingStudentsRef = ref(accountingDatabase, 'studentAccounts');
    const accountingSnapshot = await get(accountingStudentsRef);

    const mainCount = mainSnapshot.exists() ? Object.keys(mainSnapshot.val()).length : 0;
    const accountingCount = accountingSnapshot.exists() ? Object.keys(accountingSnapshot.val()).length : 0;

    return {
      success: true,
      data: {
        mainDatabaseStudents: mainCount,
        accountingDatabaseAccounts: accountingCount,
        inSync: mainCount === accountingCount,
        difference: Math.abs(mainCount - accountingCount),
        lastChecked: Date.now()
      }
    };
  } catch (error) {
    console.error('Error checking sync status:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Force full sync between databases
 */
export const forceSyncAll = async () => {
  try {
    console.log('Starting full database sync...');

    // Sync all student fees
    const result = await syncAllStudentFees();

    if (result.success) {
      console.log(`Successfully synced ${result.count} student accounts`);
      return { success: true, message: `Synced ${result.count} accounts` };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error during full sync:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Initialize sync system
 */
export const initializeSyncSystem = async () => {
  try {
    console.log('Initializing database sync system...');

    // Perform initial full sync
    await forceSyncAll();

    // Setup real-time listeners
    setupStudentFeesListener();

    console.log('Database sync system initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Error initializing sync system:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cleanup sync system
 */
export const cleanupSyncSystem = () => {
  stopStudentFeesListener();
  console.log('Database sync system cleaned up');
};

// ============================================
// AUTO-SYNC SCHEDULER
// ============================================

let syncIntervalId = null;

/**
 * Start automatic sync at regular intervals
 */
export const startAutoSync = (interval = SYNC_CONFIG.syncInterval) => {
  if (syncIntervalId) {
    console.log('Auto-sync is already running');
    return;
  }

  syncIntervalId = setInterval(async () => {
    console.log('Running scheduled sync...');
    await forceSyncAll();
  }, interval);

  console.log(`Auto-sync started with interval: ${interval}ms`);
};

/**
 * Stop automatic sync
 */
export const stopAutoSync = () => {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
    console.log('Auto-sync stopped');
  }
};

// ============================================
// CONFLICT RESOLUTION
// ============================================

/**
 * Resolve conflicts between databases
 * Uses timestamp-based resolution (most recent wins)
 */
export const resolveConflict = async (studentId) => {
  try {
    // Get data from both databases
    const mainRef = ref(database, `students/${studentId}`);
    const mainSnapshot = await get(mainRef);

    const accountingRef = ref(accountingDatabase, `studentAccounts/${studentId}`);
    const accountingSnapshot = await get(accountingRef);

    if (!mainSnapshot.exists() && !accountingSnapshot.exists()) {
      return { success: false, error: 'Student not found in either database' };
    }

    // If only in one database, sync to the other
    if (!mainSnapshot.exists()) {
      return await syncStudentFeesFromMain(studentId);
    }

    if (!accountingSnapshot.exists()) {
      return await syncStudentFeesFromMain(studentId);
    }

    // Both exist, use most recent
    const mainData = mainSnapshot.val();
    const accountingData = accountingSnapshot.val();

    const mainUpdated = mainData.fees?.updatedAt || 0;
    const accountingUpdated = accountingData.updatedAt || 0;

    if (accountingUpdated > mainUpdated) {
      // Accounting database is more recent, sync to main
      await syncPaymentToMainDB(studentId, {
        amount: accountingData.totalPaid - (mainData.fees?.paid || 0),
        date: accountingData.updatedAt,
        method: 'sync',
        reference: 'conflict-resolution',
        description: 'Synced from accounting database',
        transactionId: `sync-${Date.now()}`
      });
    } else {
      // Main database is more recent, sync to accounting
      await syncStudentFeesFromMain(studentId);
    }

    return { success: true };
  } catch (error) {
    console.error('Error resolving conflict:', error);
    return { success: false, error: error.message };
  }
};

export default {
  syncStudentFeesFromMain,
  syncAllStudentFees,
  syncPaymentToMainDB,
  setupStudentFeesListener,
  stopStudentFeesListener,
  syncAccountingTransactionToMain,
  syncFeeStructureToMain,
  checkSyncStatus,
  forceSyncAll,
  initializeSyncSystem,
  cleanupSyncSystem,
  startAutoSync,
  stopAutoSync,
  resolveConflict
};
