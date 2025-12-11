# Accounting System Documentation

## Overview

The accounting system is a separate, fully-featured financial management module for the Ghana School Management System. It includes its own database instance that syncs with the main database to ensure data integrity and accuracy.

## Architecture

### Database Structure

The accounting system uses a **separate Firebase Realtime Database instance** that:
- Operates independently from the main school database
- Maintains its own data structure for financial records
- Syncs bidirectionally with the main database
- Ensures data consistency through automated synchronization

### Database Schema

```
accountingDatabase/
├── transactions/
│   ├── {transactionId}/
│   │   ├── id
│   │   ├── type (income/expense)
│   │   ├── amount
│   │   ├── description
│   │   ├── category
│   │   ├── paymentMethod
│   │   ├── reference
│   │   ├── studentId
│   │   ├── status
│   │   ├── createdBy
│   │   ├── createdAt
│   │   └── updatedAt
│
├── feeStructures/
│   ├── {feeId}/
│   │   ├── id
│   │   ├── name
│   │   ├── amount
│   │   ├── category
│   │   ├── academicYear
│   │   ├── term
│   │   ├── description
│   │   ├── isActive
│   │   ├── createdAt
│   │   └── updatedAt
│
├── studentAccounts/
│   ├── {studentId}/
│   │   ├── studentId
│   │   ├── studentName
│   │   ├── class
│   │   ├── totalFees
│   │   ├── totalPaid
│   │   ├── balance
│   │   ├── lastPaymentDate
│   │   ├── transactions[]
│   │   └── updatedAt
│
├── expenses/
│   ├── {expenseId}/
│   │   ├── id
│   │   ├── description
│   │   ├── amount
│   │   ├── category
│   │   ├── vendor
│   │   ├── invoiceNumber
│   │   ├── status
│   │   ├── createdBy
│   │   ├── approvedBy
│   │   ├── approvedAt
│   │   ├── createdAt
│   │   └── updatedAt
│
├── budgets/
│   ├── {budgetId}/
│   │   ├── id
│   │   ├── name
│   │   ├── amount
│   │   ├── spent
│   │   ├── remaining
│   │   ├── category
│   │   ├── startDate
│   │   ├── endDate
│   │   ├── createdAt
│   │   └── updatedAt
│
└── auditLogs/
    ├── {logId}/
    │   ├── id
    │   ├── action
    │   ├── userId
    │   ├── userName
    │   ├── details
    │   ├── metadata
    │   └── timestamp
```

## Features

### 1. Transaction Management
- Create, read, update, and delete financial transactions
- Support for income and expense transactions
- Multiple payment methods (cash, bank transfer, mobile money, check, card)
- Transaction categorization and tagging
- Status tracking (pending, completed, cancelled)
- Real-time transaction history

### 2. Fee Management
- Create and manage fee structures
- Configure fees by academic year and term
- Fee categorization (tuition, books, uniform, transport, meals, activities)
- Activate/deactivate fee structures
- Link fees to specific classes or grade levels

### 3. Student Account Management
- Individual student account balances
- Track total fees, payments, and outstanding balances
- Payment history for each student
- Automated balance calculations
- Sync with main student database

### 4. Expense Management
- Record and track school expenses
- Expense categorization
- Vendor and invoice tracking
- Approval workflow for expenses
- Expense status management

### 5. Budget Management
- Create and manage budgets by category
- Track budget utilization
- Budget vs. actual spending reports
- Alert system for budget overruns

### 6. Financial Reporting
- Financial summary reports
- Account receivables report
- Expense reports by category
- Budget utilization reports
- Custom date range reports
- Export capabilities

### 7. Audit Logging
- Complete audit trail of all financial activities
- Track who made changes and when
- Action logging (create, update, delete, approve)
- Metadata storage for detailed tracking
- Searchable and filterable logs

## Database Synchronization

### Sync Features

1. **Bidirectional Sync**
   - Changes in the main database automatically sync to the accounting database
   - Payment transactions in accounting sync back to student records
   - Real-time listeners for instant updates

2. **Conflict Resolution**
   - Timestamp-based resolution (most recent wins)
   - Manual conflict resolution tools
   - Data integrity checks

3. **Sync Monitoring**
   - Sync status dashboard
   - Database comparison tools
   - Automated sync health checks

### Sync Functions

```javascript
// Initialize sync system
initializeSyncSystem()

// Force full sync
forceSyncAll()

// Sync specific student
syncStudentFeesFromMain(studentId)

// Setup real-time listeners
setupStudentFeesListener()

// Check sync status
checkSyncStatus()

// Auto-sync at intervals
startAutoSync(interval)
stopAutoSync()
```

## User Role: Accountant

### Permissions

The accountant role has full access to:
- All accounting pages and features
- Transaction management
- Fee structure configuration
- Expense approval
- Budget management
- Financial reporting
- Audit log viewing

### Access Control

```javascript
USER_ROLES.ACCOUNTANT = 'accountant'
```

Routes are protected and only accessible to:
- Super Admin (full system access)
- Accountant (accounting module access)

## Pages and Components

### Dashboard
**Path:** `/dashboard` (for accountant role)
**Component:** `AccountantDashboard.jsx`

Features:
- Financial summary cards (income, expenses, net income, outstanding fees)
- Quick action buttons
- Recent transactions list
- Pending expense approvals
- Visual charts and graphs

### Transactions
**Path:** `/accountant/transactions`
**Component:** `Transactions.jsx`

Features:
- Complete transaction list
- Advanced filtering (type, status, date range, search)
- Create/edit/delete transactions
- Payment method tracking
- Reference number management

### Fee Management
**Path:** `/accountant/fees`
**Component:** `FeeManagement.jsx`

Features:
- Fee structure cards
- Create/edit fee structures
- Fee categorization
- Academic year and term management
- Active/inactive status toggle

### Expenses
**Path:** `/accountant/expenses`
**Component:** `Expenses.jsx`

Features:
- Expense list with filtering
- Create expense records
- Approval workflow
- Vendor and invoice tracking
- Category management

### Budgets
**Path:** `/accountant/budgets`
**Component:** `Budgets.jsx`

Features:
- Budget creation and management
- Budget tracking and monitoring
- Spending analysis
- Budget alerts

### Student Accounts
**Path:** `/accountant/student-accounts`
**Component:** `StudentAccounts.jsx`

Features:
- View all student account balances
- Outstanding fees tracking
- Payment history
- Account reconciliation

### Reports
**Path:** `/accountant/reports`
**Component:** `Reports.jsx`

Features:
- Financial summary reports
- Custom date range selection
- Export to PDF/Excel
- Multiple report types

### Audit Logs
**Path:** `/accountant/audit-logs`
**Component:** `AuditLogs.jsx`

Features:
- Complete audit trail
- Filter by user, action, date
- Detailed activity view
- Compliance reporting

## API Functions

### Transaction Functions

```javascript
// Create transaction
createTransaction(transactionData)

// Get transaction by ID
getTransaction(transactionId)

// Get all transactions with filters
getTransactions(filters)

// Update transaction
updateTransaction(transactionId, updates)

// Delete transaction
deleteTransaction(transactionId)
```

### Fee Management Functions

```javascript
// Create fee structure
createFeeStructure(feeData)

// Get fee structures
getFeeStructures(filters)

// Update fee structure
updateFeeStructure(feeId, updates)
```

### Student Account Functions

```javascript
// Get student account balance
getStudentAccountBalance(studentId)

// Update student account
updateStudentAccountBalance(studentId, accountData)
```

### Expense Functions

```javascript
// Create expense
createExpense(expenseData)

// Get expenses
getExpenses(filters)

// Update expense
updateExpense(expenseId, updates)

// Approve expense
approveExpense(expenseId, approvedBy)
```

### Budget Functions

```javascript
// Create budget
createBudget(budgetData)

// Get budgets
getBudgets(filters)

// Update budget
updateBudget(budgetId, updates)
```

### Reporting Functions

```javascript
// Generate financial summary
getFinancialSummary(startDate, endDate)

// Get account receivables
getAccountReceivables()
```

### Audit Functions

```javascript
// Create audit log
createAuditLog(logData)

// Get audit logs
getAuditLogs(filters)
```

## Environment Variables

Add these to your `.env` file for separate accounting database:

```env
# Accounting Database Configuration
VITE_ACCOUNTING_FIREBASE_API_KEY=your_api_key
VITE_ACCOUNTING_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_ACCOUNTING_FIREBASE_DATABASE_URL=your_database_url
VITE_ACCOUNTING_FIREBASE_PROJECT_ID=your_project_id
VITE_ACCOUNTING_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_ACCOUNTING_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_ACCOUNTING_FIREBASE_APP_ID=your_app_id
```

## Redux State Management

### Accounting Slice

```javascript
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTransactions,
  fetchFeeStructures,
  fetchExpenses,
  setFilters
} from '../store/slices/accountingSlice';

// Usage in components
const dispatch = useDispatch();
const { transactions, loading, error } = useSelector(state => state.accounting);

// Fetch data
dispatch(fetchTransactions({ type: 'income', status: 'completed' }));
```

## Security Considerations

1. **Role-Based Access**
   - Only accountant and super admin roles can access accounting features
   - Protected routes enforce role permissions

2. **Data Encryption**
   - Sensitive financial data is encrypted
   - Secure transmission between databases

3. **Audit Trail**
   - All actions are logged
   - Complete accountability for financial operations

4. **Data Integrity**
   - Bidirectional sync ensures consistency
   - Automated validation checks
   - Conflict resolution mechanisms

## Best Practices

1. **Regular Sync**
   - Enable auto-sync for real-time updates
   - Run manual sync daily for verification

2. **Backup**
   - Regular database backups
   - Export financial reports periodically

3. **Reconciliation**
   - Monthly reconciliation of student accounts
   - Verify sync status regularly

4. **Documentation**
   - Record all manual adjustments
   - Document expense approvals

## Troubleshooting

### Sync Issues

If data is not syncing properly:

```javascript
// Check sync status
const status = await checkSyncStatus();
console.log(status);

// Force full sync
const result = await forceSyncAll();

// Resolve specific conflicts
await resolveConflict(studentId);
```

### Database Connection

Verify database configurations in:
- `src/config/accounting.firebase.config.js`
- `src/config/firebase.config.js`

### Permission Errors

Ensure Firebase security rules allow:
- Read/write access for authenticated accountants
- Proper role-based permissions

## Future Enhancements

1. **Automated Receipts**
   - Generate PDF receipts for payments
   - Email receipts to parents

2. **Payment Gateway Integration**
   - Online payment processing
   - Mobile money integration

3. **Advanced Analytics**
   - Predictive analytics
   - Financial forecasting
   - Trend analysis

4. **Multi-Currency Support**
   - Support for multiple currencies
   - Exchange rate management

5. **Bulk Operations**
   - Bulk fee assignments
   - Mass payment processing

## Support

For issues or questions:
1. Check the audit logs for error details
2. Review the sync status dashboard
3. Contact system administrator
4. Refer to Firebase documentation for database-specific issues

---

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Maintained By:** Ghana School Management System Team
