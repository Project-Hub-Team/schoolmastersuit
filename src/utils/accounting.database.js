/**
 * Accounting Database Utilities
 * Handles all accounting-related database operations
 * Separate database instance with sync to main database
 */

import { 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  push, 
  query, 
  orderByChild, 
  equalTo,
  onValue,
  off
} from 'firebase/database';
import { accountingDatabase, accountingConfigured } from '../config/accounting.firebase.config';
import { database } from '../config/firebase.config';

// ============================================
// TRANSACTION MANAGEMENT
// ============================================

/**
 * Create a new financial transaction
 */
export const createTransaction = async (transactionData) => {
  try {
    // Check if accounting database is configured
    if (!accountingConfigured || !accountingDatabase) {
      return { success: false, error: 'Accounting database not configured' };
    }

    const transactionRef = push(ref(accountingDatabase, 'transactions'));
    const transactionId = transactionRef.key;
    
    const transaction = {
      id: transactionId,
      ...transactionData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: transactionData.status || 'pending'
    };
    
    await set(transactionRef, transaction);
    
    // Sync to main database
    await syncTransactionToMainDB(transaction);
    
    return { success: true, data: transaction, id: transactionId };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get transaction by ID
 */
export const getTransaction = async (transactionId) => {
  try {
    const transactionRef = ref(accountingDatabase, `transactions/${transactionId}`);
    const snapshot = await get(transactionRef);
    
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    }
    
    return { success: false, error: 'Transaction not found' };
  } catch (error) {
    console.error('Error getting transaction:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all transactions with optional filters
 */
export const getTransactions = async (filters = {}) => {
  try {
    let transactionQuery = ref(accountingDatabase, 'transactions');
    
    if (filters.type) {
      transactionQuery = query(transactionQuery, orderByChild('type'), equalTo(filters.type));
    }
    
    const snapshot = await get(transactionQuery);
    
    if (snapshot.exists()) {
      const transactions = [];
      snapshot.forEach((child) => {
        transactions.push({ id: child.key, ...child.val() });
      });
      
      // Apply additional filters
      let filtered = transactions;
      
      if (filters.studentId) {
        filtered = filtered.filter(t => t.studentId === filters.studentId);
      }
      
      if (filters.status) {
        filtered = filtered.filter(t => t.status === filters.status);
      }
      
      if (filters.startDate) {
        filtered = filtered.filter(t => t.createdAt >= filters.startDate);
      }
      
      if (filters.endDate) {
        filtered = filtered.filter(t => t.createdAt <= filters.endDate);
      }
      
      return { success: true, data: filtered };
    }
    
    return { success: true, data: [] };
  } catch (error) {
    console.error('Error getting transactions:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update transaction
 */
export const updateTransaction = async (transactionId, updates) => {
  try {
    const transactionRef = ref(accountingDatabase, `transactions/${transactionId}`);
    const updateData = {
      ...updates,
      updatedAt: Date.now()
    };
    
    await update(transactionRef, updateData);
    
    // Sync to main database
    const transaction = await getTransaction(transactionId);
    if (transaction.success) {
      await syncTransactionToMainDB(transaction.data);
    }
    
    return { success: true, data: updateData };
  } catch (error) {
    console.error('Error updating transaction:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete transaction
 */
export const deleteTransaction = async (transactionId) => {
  try {
    const transactionRef = ref(accountingDatabase, `transactions/${transactionId}`);
    await remove(transactionRef);
    
    // Remove from main database sync
    const mainRef = ref(database, `accounting/transactions/${transactionId}`);
    await remove(mainRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// FEE MANAGEMENT
// ============================================

/**
 * Create fee structure
 */
export const createFeeStructure = async (feeData) => {
  try {
    const feeRef = push(ref(accountingDatabase, 'feeStructures'));
    const feeId = feeRef.key;
    
    const fee = {
      id: feeId,
      ...feeData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: feeData.isActive !== undefined ? feeData.isActive : true
    };
    
    await set(feeRef, fee);
    
    // Sync to main database
    await syncFeeStructureToMainDB(fee);
    
    return { success: true, data: fee, id: feeId };
  } catch (error) {
    console.error('Error creating fee structure:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get fee structures
 */
export const getFeeStructures = async (filters = {}) => {
  try {
    const feeRef = ref(accountingDatabase, 'feeStructures');
    const snapshot = await get(feeRef);
    
    if (snapshot.exists()) {
      const fees = [];
      snapshot.forEach((child) => {
        fees.push({ id: child.key, ...child.val() });
      });
      
      // Apply filters
      let filtered = fees;
      
      if (filters.isActive !== undefined) {
        filtered = filtered.filter(f => f.isActive === filters.isActive);
      }
      
      if (filters.academicYear) {
        filtered = filtered.filter(f => f.academicYear === filters.academicYear);
      }
      
      if (filters.term) {
        filtered = filtered.filter(f => f.term === filters.term);
      }
      
      return { success: true, data: filtered };
    }
    
    return { success: true, data: [] };
  } catch (error) {
    console.error('Error getting fee structures:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update fee structure
 */
export const updateFeeStructure = async (feeId, updates) => {
  try {
    const feeRef = ref(accountingDatabase, `feeStructures/${feeId}`);
    const updateData = {
      ...updates,
      updatedAt: Date.now()
    };
    
    await update(feeRef, updateData);
    
    // Sync to main database
    const feeStructure = await get(feeRef);
    if (feeStructure.exists()) {
      await syncFeeStructureToMainDB(feeStructure.val());
    }
    
    return { success: true, data: updateData };
  } catch (error) {
    console.error('Error updating fee structure:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// STUDENT ACCOUNT MANAGEMENT
// ============================================

/**
 * Get student account balance
 */
export const getStudentAccountBalance = async (studentId) => {
  try {
    const accountRef = ref(accountingDatabase, `studentAccounts/${studentId}`);
    const snapshot = await get(accountRef);
    
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    }
    
    // Return default account structure
    return { 
      success: true, 
      data: {
        studentId,
        totalFees: 0,
        totalPaid: 0,
        balance: 0,
        lastPaymentDate: null,
        transactions: []
      }
    };
  } catch (error) {
    console.error('Error getting student account:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update student account balance
 */
export const updateStudentAccountBalance = async (studentId, accountData) => {
  try {
    const accountRef = ref(accountingDatabase, `studentAccounts/${studentId}`);
    const updateData = {
      ...accountData,
      studentId,
      updatedAt: Date.now()
    };
    
    await set(accountRef, updateData);
    
    // Sync to main database
    await syncStudentAccountToMainDB(studentId, updateData);
    
    return { success: true, data: updateData };
  } catch (error) {
    console.error('Error updating student account:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all student accounts
 */
export const getStudentAccounts = async () => {
  try {
    const accountsRef = ref(accountingDatabase, 'studentAccounts');
    const snapshot = await get(accountsRef);
    
    if (snapshot.exists()) {
      const accounts = [];
      snapshot.forEach((child) => {
        accounts.push({ studentId: child.key, ...child.val() });
      });
      
      return { success: true, data: accounts };
    }
    
    return { success: true, data: [] };
  } catch (error) {
    console.error('Error getting student accounts:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// EXPENSE MANAGEMENT
// ============================================

/**
 * Create expense record
 */
export const createExpense = async (expenseData) => {
  try {
    const expenseRef = push(ref(accountingDatabase, 'expenses'));
    const expenseId = expenseRef.key;
    
    const expense = {
      id: expenseId,
      ...expenseData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: expenseData.status || 'pending'
    };
    
    await set(expenseRef, expense);
    
    return { success: true, data: expense, id: expenseId };
  } catch (error) {
    console.error('Error creating expense:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get expenses
 */
export const getExpenses = async (filters = {}) => {
  try {
    const expenseRef = ref(accountingDatabase, 'expenses');
    const snapshot = await get(expenseRef);
    
    if (snapshot.exists()) {
      const expenses = [];
      snapshot.forEach((child) => {
        expenses.push({ id: child.key, ...child.val() });
      });
      
      // Apply filters
      let filtered = expenses;
      
      if (filters.status) {
        filtered = filtered.filter(e => e.status === filters.status);
      }
      
      if (filters.category) {
        filtered = filtered.filter(e => e.category === filters.category);
      }
      
      if (filters.startDate) {
        filtered = filtered.filter(e => e.createdAt >= filters.startDate);
      }
      
      if (filters.endDate) {
        filtered = filtered.filter(e => e.createdAt <= filters.endDate);
      }
      
      return { success: true, data: filtered };
    }
    
    return { success: true, data: [] };
  } catch (error) {
    console.error('Error getting expenses:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update expense
 */
export const updateExpense = async (expenseId, updates) => {
  try {
    const expenseRef = ref(accountingDatabase, `expenses/${expenseId}`);
    const updateData = {
      ...updates,
      updatedAt: Date.now()
    };
    
    await update(expenseRef, updateData);
    
    return { success: true, data: updateData };
  } catch (error) {
    console.error('Error updating expense:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Approve expense
 */
export const approveExpense = async (expenseId, approvedBy) => {
  try {
    const expenseRef = ref(accountingDatabase, `expenses/${expenseId}`);
    const updateData = {
      status: 'approved',
      approvedBy,
      approvedAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await update(expenseRef, updateData);
    
    return { success: true, data: updateData };
  } catch (error) {
    console.error('Error approving expense:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// BUDGET MANAGEMENT
// ============================================

/**
 * Create budget
 */
export const createBudget = async (budgetData) => {
  try {
    const budgetRef = push(ref(accountingDatabase, 'budgets'));
    const budgetId = budgetRef.key;
    
    const budget = {
      id: budgetId,
      ...budgetData,
      spent: 0,
      remaining: budgetData.amount,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await set(budgetRef, budget);
    
    return { success: true, data: budget, id: budgetId };
  } catch (error) {
    console.error('Error creating budget:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get budgets
 */
export const getBudgets = async (filters = {}) => {
  try {
    const budgetRef = ref(accountingDatabase, 'budgets');
    const snapshot = await get(budgetRef);
    
    if (snapshot.exists()) {
      const budgets = [];
      snapshot.forEach((child) => {
        budgets.push({ id: child.key, ...child.val() });
      });
      
      return { success: true, data: budgets };
    }
    
    return { success: true, data: [] };
  } catch (error) {
    console.error('Error getting budgets:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update budget
 */
export const updateBudget = async (budgetId, updates) => {
  try {
    const budgetRef = ref(accountingDatabase, `budgets/${budgetId}`);
    const updateData = {
      ...updates,
      updatedAt: Date.now()
    };
    
    if (updateData.amount && updateData.spent !== undefined) {
      updateData.remaining = updateData.amount - updateData.spent;
    }
    
    await update(budgetRef, updateData);
    
    return { success: true, data: updateData };
  } catch (error) {
    console.error('Error updating budget:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete budget
 */
export const deleteBudget = async (budgetId) => {
  try {
    const budgetRef = ref(accountingDatabase, `budgets/${budgetId}`);
    await remove(budgetRef);
    
    // Log the deletion
    await createAuditLog({
      action: 'delete',
      entity: 'budget',
      entityId: budgetId,
      details: 'Budget deleted'
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting budget:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// FINANCIAL REPORTS
// ============================================

/**
 * Generate financial summary
 */
export const getFinancialSummary = async (startDate, endDate) => {
  try {
    // Get all transactions in date range
    const transactionsResult = await getTransactions({ startDate, endDate });
    const expensesResult = await getExpenses({ startDate, endDate });
    
    if (!transactionsResult.success || !expensesResult.success) {
      throw new Error('Failed to fetch financial data');
    }
    
    const transactions = transactionsResult.data;
    const expenses = expensesResult.data;
    
    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalExpenses = expenses
      .filter(e => e.status === 'approved')
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const pendingPayments = transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const summary = {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      pendingPayments,
      transactionCount: transactions.length,
      expenseCount: expenses.length,
      generatedAt: Date.now(),
      dateRange: { startDate, endDate }
    };
    
    return { success: true, data: summary };
  } catch (error) {
    console.error('Error generating financial summary:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get account receivables (outstanding fees)
 */
export const getAccountReceivables = async () => {
  try {
    const accountsRef = ref(accountingDatabase, 'studentAccounts');
    const snapshot = await get(accountsRef);
    
    if (snapshot.exists()) {
      const receivables = [];
      let totalOutstanding = 0;
      
      snapshot.forEach((child) => {
        const account = child.val();
        if (account.balance > 0) {
          receivables.push({
            studentId: child.key,
            ...account
          });
          totalOutstanding += account.balance;
        }
      });
      
      return { 
        success: true, 
        data: {
          receivables,
          totalOutstanding,
          count: receivables.length
        }
      };
    }
    
    return { success: true, data: { receivables: [], totalOutstanding: 0, count: 0 } };
  } catch (error) {
    console.error('Error getting account receivables:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// SYNC FUNCTIONS
// ============================================

/**
 * Sync transaction to main database
 */
const syncTransactionToMainDB = async (transaction) => {
  try {
    const mainRef = ref(database, `accounting/transactions/${transaction.id}`);
    await set(mainRef, transaction);
    return { success: true };
  } catch (error) {
    console.error('Error syncing transaction to main DB:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sync fee structure to main database
 */
const syncFeeStructureToMainDB = async (feeStructure) => {
  try {
    const mainRef = ref(database, `accounting/feeStructures/${feeStructure.id}`);
    await set(mainRef, feeStructure);
    return { success: true };
  } catch (error) {
    console.error('Error syncing fee structure to main DB:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sync student account to main database
 */
const syncStudentAccountToMainDB = async (studentId, accountData) => {
  try {
    const mainRef = ref(database, `accounting/studentAccounts/${studentId}`);
    await set(mainRef, accountData);
    return { success: true };
  } catch (error) {
    console.error('Error syncing student account to main DB:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Listen to changes in main database and sync to accounting database
 */
export const setupMainDBListener = () => {
  const studentsRef = ref(database, 'students');
  
  onValue(studentsRef, (snapshot) => {
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const student = child.val();
        // Sync student fee information
        if (student.fees) {
          syncStudentAccountToMainDB(child.key, {
            studentId: child.key,
            totalFees: student.fees.total || 0,
            totalPaid: student.fees.paid || 0,
            balance: (student.fees.total || 0) - (student.fees.paid || 0),
            updatedAt: Date.now()
          });
        }
      });
    }
  });
};

/**
 * Stop listening to main database changes
 */
export const stopMainDBListener = () => {
  const studentsRef = ref(database, 'students');
  off(studentsRef);
};

// ============================================
// AUDIT LOG
// ============================================

/**
 * Create audit log entry
 */
export const createAuditLog = async (logData) => {
  try {
    const logRef = push(ref(accountingDatabase, 'auditLogs'));
    const logId = logRef.key;
    
    const log = {
      id: logId,
      ...logData,
      timestamp: Date.now()
    };
    
    await set(logRef, log);
    
    return { success: true, data: log, id: logId };
  } catch (error) {
    console.error('Error creating audit log:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get audit logs
 */
export const getAuditLogs = async (filters = {}) => {
  try {
    const logsRef = ref(accountingDatabase, 'auditLogs');
    const snapshot = await get(logsRef);
    
    if (snapshot.exists()) {
      const logs = [];
      snapshot.forEach((child) => {
        logs.push({ id: child.key, ...child.val() });
      });
      
      // Apply filters
      let filtered = logs;
      
      if (filters.userId) {
        filtered = filtered.filter(l => l.userId === filters.userId);
      }
      
      if (filters.action) {
        filtered = filtered.filter(l => l.action === filters.action);
      }
      
      if (filters.startDate) {
        filtered = filtered.filter(l => l.timestamp >= filters.startDate);
      }
      
      if (filters.endDate) {
        filtered = filtered.filter(l => l.timestamp <= filters.endDate);
      }
      
      // Sort by timestamp descending
      filtered.sort((a, b) => b.timestamp - a.timestamp);
      
      return { success: true, data: filtered };
    }
    
    return { success: true, data: [] };
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return { success: false, error: error.message };
  }
};
