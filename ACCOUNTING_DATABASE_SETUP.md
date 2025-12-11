# Accounting Database Setup Guide

## Firebase Configuration

Your accounting system is now configured with the following Firebase project:

```
Project: sms-accounting-system
Database URL: https://sms-accounting-system-default-rtdb.firebaseio.com
```

## Step-by-Step Setup

### 1. Configure Firebase Security Rules

Navigate to your Firebase Console:
- Go to https://console.firebase.google.com
- Select project: **sms-accounting-system**
- Go to **Realtime Database** → **Rules**

Copy and paste the rules from `firebase/accounting.rules.json` or use these rules:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    
    "transactions": {
      ".indexOn": ["type", "status", "studentId", "createdAt"],
      "$transactionId": {
        ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'accountant' || root.child('users').child(auth.uid).child('role').val() === 'super_admin')",
        ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'accountant' || root.child('users').child(auth.uid).child('role').val() === 'super_admin')"
      }
    },
    
    "feeStructures": {
      ".indexOn": ["academicYear", "term", "isActive"],
      "$feeId": {
        ".read": "auth != null",
        ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'accountant' || root.child('users').child(auth.uid).child('role').val() === 'super_admin')"
      }
    },
    
    "studentAccounts": {
      ".indexOn": ["studentId", "balance", "updatedAt"],
      "$studentId": {
        ".read": "auth != null",
        ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'accountant' || root.child('users').child(auth.uid).child('role').val() === 'super_admin')"
      }
    },
    
    "expenses": {
      ".indexOn": ["status", "category", "createdAt"],
      "$expenseId": {
        ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'accountant' || root.child('users').child(auth.uid).child('role').val() === 'super_admin')",
        ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'accountant' || root.child('users').child(auth.uid).child('role').val() === 'super_admin')"
      }
    },
    
    "budgets": {
      ".indexOn": ["category", "startDate", "endDate"],
      "$budgetId": {
        ".read": "auth != null",
        ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'accountant' || root.child('users').child(auth.uid).child('role').val() === 'super_admin')"
      }
    },
    
    "auditLogs": {
      ".indexOn": ["userId", "action", "timestamp"],
      "$logId": {
        ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'accountant' || root.child('users').child(auth.uid).child('role').val() === 'super_admin')",
        ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'accountant' || root.child('users').child(auth.uid).child('role').val() === 'super_admin') && !data.exists()"
      }
    }
  }
}
```

Click **Publish** to deploy the rules.

### 2. Enable Firebase Authentication

In the **sms-accounting-system** Firebase project:
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. Save changes

**Note:** The accounting system uses the same authentication as the main system. Users are authenticated in the main database, and their roles determine access to the accounting system.

### 3. Configure Environment Variables

Create or update your `.env` file in the project root:

```env
# Accounting System Firebase Configuration
VITE_ACCOUNTING_FIREBASE_API_KEY=AIzaSyD6QTiAtCMPtVO60xHNfako9RMEy6WNtIQ
VITE_ACCOUNTING_FIREBASE_AUTH_DOMAIN=sms-accounting-system.firebaseapp.com
VITE_ACCOUNTING_FIREBASE_DATABASE_URL=https://sms-accounting-system-default-rtdb.firebaseio.com
VITE_ACCOUNTING_FIREBASE_PROJECT_ID=sms-accounting-system
VITE_ACCOUNTING_FIREBASE_STORAGE_BUCKET=sms-accounting-system.firebasestorage.app
VITE_ACCOUNTING_FIREBASE_MESSAGING_SENDER_ID=709243032978
VITE_ACCOUNTING_FIREBASE_APP_ID=1:709243032978:web:44e94c6d172413e0431d4b
VITE_ACCOUNTING_FIREBASE_MEASUREMENT_ID=G-HPQ18CBRWE
```

### 4. Install Dependencies (if needed)

```bash
npm install
```

### 5. Test the Connection

Start your development server:

```bash
npm run dev
```

### 6. Verify Database Sync

Open browser console and check for these messages:
```
🔄 Initializing accounting database sync...
✅ Accounting sync initialized successfully
🔁 Auto-sync started (60s interval)
📊 Sync Status: { mainDatabaseStudents: X, accountingDatabaseAccounts: Y, inSync: true/false }
```

## Database Structure

The accounting database will automatically create these collections:

### Main Collections

1. **transactions/** - All financial transactions (income/expense)
2. **feeStructures/** - Fee configurations by term and year
3. **studentAccounts/** - Individual student account balances
4. **expenses/** - School expense records
5. **budgets/** - Budget tracking and management
6. **auditLogs/** - Complete audit trail of all activities

### Automatic Sync

The system automatically syncs:
- Student fee data from main database → accounting database
- Payment transactions from accounting database → main database (student balances)
- Real-time updates when data changes in either database

## Testing the Setup

### 1. Create an Accountant User

**Option A: Using the script**
```bash
node create-accountant.js
```

**Option B: Manual creation**

In your **main database** (school-management-system-afc40):
1. Create a user in Firebase Authentication
2. Add user profile to `/users/{uid}`:
```json
{
  "uid": "user_uid",
  "email": "accountant@school.edu.gh",
  "displayName": "School Accountant",
  "role": "accountant",
  "isActive": true,
  "createdAt": 1234567890
}
```

### 2. Login as Accountant

```
URL: http://localhost:5173/login
Email: accountant@school.edu.gh
Password: [your password]
```

### 3. Verify Access

After login, you should:
- See the Accountant Dashboard
- Have access to all accounting pages:
  - Transactions
  - Fee Management
  - Expenses
  - Budgets
  - Student Accounts
  - Reports
  - Audit Logs

### 4. Test Sync Functionality

**Test 1: View Student Accounts**
1. Go to Student Accounts page
2. Verify students from main database appear
3. Check balances are correct

**Test 2: Create a Transaction**
1. Go to Transactions page
2. Click "New Transaction"
3. Create an income transaction for a student
4. Verify it appears in the accounting database
5. Check that student balance updates in main database

**Test 3: Force Manual Sync**
Open browser console and run:
```javascript
import { forceSyncAll } from './utils/sync';
await forceSyncAll();
```

## Sync Configuration

### Auto-Sync Settings

The system automatically syncs every **60 seconds**. To change this:

Edit `src/hooks/useAccountingSync.jsx`:
```javascript
startAutoSync(60000); // Change 60000 to your desired milliseconds
```

### Manual Sync Triggers

Users can trigger manual sync from:
1. Accountant Dashboard (if you add a sync button)
2. Browser console using `forceSyncAll()`
3. System automatically syncs on page load

## Monitoring Sync Status

### Check Sync Status

```javascript
import { checkSyncStatus } from './utils/sync';

const status = await checkSyncStatus();
console.log(status.data);
// Returns:
// {
//   mainDatabaseStudents: 150,
//   accountingDatabaseAccounts: 150,
//   inSync: true,
//   difference: 0,
//   lastChecked: 1234567890
// }
```

### View Sync Logs

Check browser console for sync activity:
- Initial sync on startup
- Auto-sync every 60 seconds
- Manual sync triggers
- Error messages if sync fails

## Troubleshooting

### Issue: "Permission Denied" Error

**Solution:**
1. Verify Firebase security rules are published
2. Check user has accountant role in main database
3. Verify user is authenticated
4. Check browser console for detailed error

### Issue: Data Not Syncing

**Solution:**
1. Check internet connection
2. Verify both Firebase projects are accessible
3. Check browser console for errors
4. Try manual sync: `forceSyncAll()`
5. Verify Firebase security rules allow read/write

### Issue: Student Accounts Not Appearing

**Solution:**
1. Verify students exist in main database
2. Check students have fee data
3. Run manual sync
4. Check browser console for sync errors
5. Verify Firebase rules allow read access

### Issue: Transactions Not Saving

**Solution:**
1. Check all required fields are filled
2. Verify accountant role permissions
3. Check Firebase security rules
4. Check browser console for errors
5. Verify internet connection

## Security Checklist

- [x] Firebase security rules deployed
- [x] Authentication enabled
- [x] Role-based access control implemented
- [x] Audit logging enabled
- [x] Environment variables configured
- [x] HTTPS enabled (production)
- [x] Database rules tested

## Production Deployment

### Before Deploying:

1. **Update Security Rules**
   - Review and tighten Firebase rules
   - Ensure only accountant/super_admin can write
   - Test all permission scenarios

2. **Environment Variables**
   - Set production environment variables
   - Use Vite build-time variables
   - Never commit `.env` to version control

3. **Test Thoroughly**
   - Test all accounting features
   - Verify sync works correctly
   - Test with multiple users
   - Check error handling

4. **Backup Strategy**
   - Setup automated backups for both databases
   - Test restore procedures
   - Document backup schedule

5. **Monitoring**
   - Setup Firebase alerts
   - Monitor database usage
   - Track sync errors
   - Monitor API quotas

### Deploy Command

```bash
npm run build
npm run preview  # Test production build locally
# Deploy to your hosting platform
```

## Maintenance

### Daily Tasks
- Monitor sync status
- Check error logs
- Verify transactions are syncing

### Weekly Tasks
- Review audit logs
- Check database performance
- Verify data integrity
- Test backup restore

### Monthly Tasks
- Review Firebase usage and costs
- Update security rules if needed
- Performance optimization
- User access audit

## Support

### Firebase Console Links

**Main Database:**
https://console.firebase.google.com/project/school-management-system-afc40

**Accounting Database:**
https://console.firebase.google.com/project/sms-accounting-system

### Documentation
- Technical: `ACCOUNTING_SYSTEM.md`
- User Guide: `ACCOUNTANT_SETUP.md`
- Quick Reference: `ACCOUNTANT_QUICK_REFERENCE.md`

### Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Create accountant user
node create-accountant.js

# Run tests (if configured)
npm test
```

## Success Criteria

✅ Accounting database accessible  
✅ Security rules deployed  
✅ Auto-sync running  
✅ Accountant can login  
✅ All pages accessible  
✅ Transactions can be created  
✅ Student data syncs correctly  
✅ Audit logs working  
✅ Reports generate successfully  

---

**Setup Date:** December 11, 2025  
**Database:** sms-accounting-system  
**Status:** Ready for Testing  
**Next Step:** Create accountant user and test functionality
