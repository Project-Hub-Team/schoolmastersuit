# Accountant Setup Guide

## Creating an Accountant User

### Option 1: Using Super Admin Dashboard

1. **Login as Super Admin**
   - Navigate to the login page
   - Use super admin credentials

2. **Create New User**
   - Go to "Manage Admins" or user management
   - Click "Add New User"
   - Fill in the form:
     ```
     Email: accountant@school.edu.gh
     Password: [Secure Password]
     Role: Accountant
     Display Name: [Accountant Name]
     ```

3. **Verify Creation**
   - Check that the user appears in the user list
   - Verify the role is set to "accountant"

### Option 2: Using Firebase Console

1. **Create Firebase User**
   ```
   - Go to Firebase Console
   - Navigate to Authentication
   - Click "Add User"
   - Enter email and password
   ```

2. **Add User Profile to Database**
   ```javascript
   // In Firebase Realtime Database at: /users/{uid}
   {
     "uid": "user_uid_here",
     "email": "accountant@school.edu.gh",
     "role": "accountant",
     "displayName": "School Accountant",
     "isActive": true,
     "createdAt": 1234567890,
     "lastLogin": 1234567890
   }
   ```

### Option 3: Using Registration with Role Assignment

1. **Register New User**
   - Use the registration page
   - Complete the registration form

2. **Update User Role**
   ```javascript
   // A super admin must update the role in Firebase
   // Navigate to: /users/{uid}/role
   // Change value to: "accountant"
   ```

## Initial Setup for Accountant

### 1. First Login

```
URL: https://your-school-system.com/login
Email: accountant@school.edu.gh
Password: [Your Password]
```

### 2. Configure Database Connection

Verify environment variables are set in `.env`:

```env
VITE_ACCOUNTING_FIREBASE_API_KEY=your_api_key
VITE_ACCOUNTING_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_ACCOUNTING_FIREBASE_DATABASE_URL=your_database_url
VITE_ACCOUNTING_FIREBASE_PROJECT_ID=your_project_id
VITE_ACCOUNTING_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_ACCOUNTING_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_ACCOUNTING_FIREBASE_APP_ID=your_app_id
```

### 3. Initialize Sync System

On first login, the sync system should automatically initialize. To manually initialize:

```javascript
import { initializeSyncSystem } from '../utils/sync';

// Run once on accountant dashboard mount
await initializeSyncSystem();
```

### 4. Verify Database Access

Check that the accountant can:
- ✅ View dashboard
- ✅ Access transactions page
- ✅ Create new transactions
- ✅ View fee structures
- ✅ Access reports

## Database Sync Setup

### Automatic Sync Configuration

The sync system runs automatically when:
1. Accountant logs in
2. Dashboard loads
3. Student data changes in main database

### Manual Sync Trigger

If needed, trigger manual sync:

```javascript
// In browser console or via UI button
import { forceSyncAll } from './utils/sync';
await forceSyncAll();
```

### Sync Monitoring

Monitor sync status:
```javascript
import { checkSyncStatus } from './utils/sync';
const status = await checkSyncStatus();
console.log(status);
```

## Initial Data Setup

### 1. Create Fee Structures

Navigate to **Fee Management** and create:

```
Fee Name: Tuition Fee - Term 1
Amount: 500.00 GHS
Category: Tuition
Academic Year: 2024/2025
Term: 1
Status: Active
```

### 2. Setup Budgets

Navigate to **Budgets** and create:

```
Budget Name: Operating Expenses Q1
Amount: 50000.00 GHS
Category: Operations
Period: January - March 2025
```

### 3. Import Student Fee Data

The system automatically syncs student data from the main database. To verify:

1. Go to **Student Accounts**
2. Check that student accounts are populated
3. Verify balances match main database

## Common Tasks

### Recording a Payment

1. Navigate to **Transactions**
2. Click "New Transaction"
3. Fill in details:
   ```
   Type: Income
   Amount: 500.00
   Description: Tuition payment - Term 1
   Category: Tuition
   Payment Method: Cash
   Student ID: [Student ID]
   Status: Completed
   ```
4. Click "Create"

### Recording an Expense

1. Navigate to **Expenses**
2. Click "New Expense"
3. Fill in details:
   ```
   Description: Office supplies
   Amount: 150.00
   Category: Supplies
   Vendor: ABC Stationery
   Invoice Number: INV-001
   Status: Pending
   ```
4. Click "Create"
5. Review and approve when ready

### Generating Reports

1. Navigate to **Reports**
2. Select report type
3. Choose date range
4. Click "Generate Report"
5. Export as PDF or Excel

## Security Best Practices

### Password Management

- Use strong, unique passwords
- Change password regularly
- Never share credentials
- Use password manager

### Access Control

- Only access accounting features when needed
- Log out when leaving workstation
- Don't share your login session

### Data Protection

- Don't export sensitive data to unsecured devices
- Verify recipient before sharing reports
- Use secure channels for data transmission

## Troubleshooting

### Can't Access Accounting Pages

**Issue:** "Access Denied" or redirect to dashboard

**Solution:**
1. Verify role is set to "accountant" in Firebase
2. Check user profile in database: `/users/{uid}/role`
3. Log out and log back in
4. Contact super admin to verify permissions

### Data Not Syncing

**Issue:** Student balances don't match main database

**Solution:**
1. Check sync status: Navigate to dashboard
2. Run manual sync: Click "Force Sync" button
3. Verify Firebase connection
4. Check browser console for errors

### Transactions Not Saving

**Issue:** Error when creating transactions

**Solution:**
1. Verify all required fields are filled
2. Check internet connection
3. Verify Firebase database rules
4. Check browser console for errors
5. Try refreshing the page

### Missing Student Accounts

**Issue:** Some students don't appear in Student Accounts

**Solution:**
1. Verify students exist in main database
2. Run full sync: `forceSyncAll()`
3. Check student has fee data
4. Verify database permissions

## Training Resources

### Getting Started

1. **Dashboard Overview** (10 minutes)
   - Understanding financial summary cards
   - Quick actions
   - Recent activity

2. **Transaction Management** (20 minutes)
   - Creating income transactions
   - Recording expenses
   - Using filters and search

3. **Fee Management** (15 minutes)
   - Creating fee structures
   - Managing fee categories
   - Activating/deactivating fees

4. **Reporting** (15 minutes)
   - Generating financial reports
   - Exporting data
   - Understanding financial metrics

### Advanced Topics

1. **Budget Management** (20 minutes)
2. **Expense Approval Workflow** (15 minutes)
3. **Audit Log Review** (10 minutes)
4. **Data Reconciliation** (20 minutes)

## Support Contacts

### Technical Support
- Email: techsupport@school.edu.gh
- Phone: +233 XX XXX XXXX

### System Administrator
- Name: [Admin Name]
- Email: admin@school.edu.gh
- Phone: +233 XX XXX XXXX

### Super Admin
- For role and permission changes
- For system-wide issues

## Checklist for Accountant Setup

- [ ] User account created with accountant role
- [ ] Successfully logged in to system
- [ ] Can access accountant dashboard
- [ ] Can view all accounting pages
- [ ] Database sync verified
- [ ] Fee structures created
- [ ] Test transaction created successfully
- [ ] Test expense recorded successfully
- [ ] Reports generated successfully
- [ ] Audit logs accessible
- [ ] Student accounts visible
- [ ] Permissions verified
- [ ] Training completed
- [ ] Documentation reviewed

## Monthly Tasks

### Beginning of Month
- [ ] Review outstanding fees
- [ ] Generate previous month report
- [ ] Reconcile accounts
- [ ] Update budget tracking

### During Month
- [ ] Record daily transactions
- [ ] Process expense approvals
- [ ] Monitor student payments
- [ ] Update fee structures if needed

### End of Month
- [ ] Close monthly accounts
- [ ] Generate monthly report
- [ ] Backup data
- [ ] Review audit logs
- [ ] Reconcile with main database

## Useful Shortcuts

### Navigation
- Dashboard: `/dashboard`
- Transactions: `/accountant/transactions`
- Fees: `/accountant/fees`
- Expenses: `/accountant/expenses`
- Reports: `/accountant/reports`

### Filters
- Use date range filters for specific periods
- Search by student ID, reference, or description
- Filter by status (pending, completed, cancelled)
- Filter by type (income, expense)

## FAQ

**Q: Can I delete a transaction?**  
A: Yes, but it will be logged in the audit trail. Only delete if absolutely necessary.

**Q: How often does data sync?**  
A: Real-time for most operations. Auto-sync runs every minute for batch updates.

**Q: Can I export reports?**  
A: Yes, reports can be exported to PDF and Excel formats.

**Q: Who can approve expenses?**  
A: Accountants and super admins can approve expenses.

**Q: How do I reconcile accounts?**  
A: Use the Student Accounts page to view all balances and compare with main database.

**Q: What if I make a mistake?**  
A: Edit the transaction or create a reversing entry. All changes are logged.

---

**Setup Version:** 1.0.0  
**Last Updated:** December 2025  
**Document Owner:** System Administrator
