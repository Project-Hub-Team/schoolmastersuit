# Accountant Quick Reference Card

## Login Credentials
```
URL: [Your School System URL]/login
Role: Accountant
```

## Navigation Shortcuts

| Page | URL Path |
|------|----------|
| Dashboard | `/dashboard` |
| Transactions | `/accountant/transactions` |
| Fee Management | `/accountant/fees` |
| Expenses | `/accountant/expenses` |
| Budgets | `/accountant/budgets` |
| Student Accounts | `/accountant/student-accounts` |
| Reports | `/accountant/reports` |
| Audit Logs | `/accountant/audit-logs` |

## Common Tasks

### Record a Payment
1. Go to **Transactions** → Click **New Transaction**
2. Set Type: **Income**
3. Enter amount, student ID, payment method
4. Set status: **Completed**
5. Click **Create**

### Record an Expense
1. Go to **Expenses** → Click **New Expense**
2. Enter description, amount, category
3. Add vendor and invoice number
4. Click **Create**
5. Approve when ready

### Create Fee Structure
1. Go to **Fee Management** → Click **New Fee Structure**
2. Enter name, amount, category
3. Set academic year and term
4. Mark as **Active**
5. Click **Create**

### Generate Report
1. Go to **Reports**
2. Select report type
3. Choose date range
4. Click **Generate**
5. Export as needed

### View Outstanding Fees
1. Go to **Student Accounts**
2. Filter by **Balance > 0**
3. View list of students with outstanding fees

## Transaction Types

| Type | Description | Example |
|------|-------------|---------|
| Income | Money received | Tuition payment, book fees |
| Expense | Money paid out | Utilities, supplies, salaries |

## Payment Methods
- Cash
- Bank Transfer
- Mobile Money
- Check
- Card

## Fee Categories
- Tuition
- Books
- Uniform
- Transport
- Meals
- Activities
- Other

## Expense Categories
- Utilities
- Salaries
- Supplies
- Maintenance
- Transport
- Other

## Status Types

### Transaction Status
- **Pending** - Awaiting processing
- **Completed** - Successfully processed
- **Cancelled** - Transaction voided

### Expense Status
- **Pending** - Awaiting approval
- **Approved** - Approved and processed
- **Rejected** - Not approved

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Search | Ctrl + F |
| New Transaction | Ctrl + N |
| Save | Ctrl + S |
| Cancel | Esc |

## Important Numbers

### Dashboard Metrics
- **Total Income** - All completed income transactions
- **Total Expenses** - All approved expenses
- **Net Income** - Income minus expenses
- **Outstanding Fees** - Sum of all student balances

### Financial Health Indicators
- **Green** - Positive net income
- **Yellow** - Breaking even
- **Red** - Negative net income

## Common Filters

### By Date
- Today
- This Week
- This Month
- This Term
- This Year
- Custom Range

### By Status
- All
- Pending
- Completed
- Cancelled/Rejected

### By Type
- All
- Income
- Expense

## Reports Available

1. **Financial Summary**
   - Total income and expenses
   - Net income
   - Transaction counts

2. **Account Receivables**
   - Outstanding student fees
   - Payment history
   - Aging analysis

3. **Expense Report**
   - By category
   - By vendor
   - By time period

4. **Budget Report**
   - Budget vs. actual
   - Variance analysis
   - Utilization percentage

## Data Sync

### Automatic Sync
- Runs every 60 seconds
- Updates student balances
- Syncs new transactions

### Manual Sync
- Use "Force Sync" button on dashboard
- Run after major updates
- Check sync status regularly

## Error Messages

| Error | Solution |
|-------|----------|
| "Access Denied" | Contact super admin to verify role |
| "Sync Failed" | Check internet, try manual sync |
| "Invalid Amount" | Enter positive number with 2 decimals |
| "Student Not Found" | Verify student ID exists in system |

## Best Practices

### Daily
✅ Record all transactions promptly  
✅ Review pending expenses  
✅ Monitor student payments  
✅ Check sync status  

### Weekly
✅ Reconcile accounts  
✅ Review audit logs  
✅ Generate weekly report  
✅ Update budgets  

### Monthly
✅ Close monthly accounts  
✅ Generate monthly report  
✅ Backup important data  
✅ Review outstanding fees  
✅ Budget variance analysis  

## Currency Format
**GHS** (Ghana Cedis)
- Format: GHS 1,234.56
- Decimal places: 2
- Separator: Comma for thousands

## Academic Calendar

### Terms
- **Term 1** - September to December
- **Term 2** - January to April  
- **Term 3** - May to August

### Academic Year
Format: 2024/2025

## Support Contacts

### Technical Issues
📧 techsupport@school.edu.gh  
📞 +233 XX XXX XXXX

### Financial Queries
📧 admin@school.edu.gh  
📞 +233 XX XXX XXXX

### Emergency
Contact Super Admin

## Audit Requirements

### What Gets Logged
✅ All transactions (create, edit, delete)  
✅ Fee structure changes  
✅ Expense approvals  
✅ Budget modifications  
✅ Report generation  

### Review Schedule
- Daily: Check recent activities
- Weekly: Review all audit logs
- Monthly: Generate audit report

## Security Reminders

🔒 Never share login credentials  
🔒 Log out when leaving workstation  
🔒 Use strong, unique password  
🔒 Verify amounts before submitting  
🔒 Review audit logs regularly  
🔒 Report suspicious activities  

## Quick Calculations

### Outstanding Balance
```
Balance = Total Fees - Total Paid
```

### Budget Remaining
```
Remaining = Budget Amount - Spent
```

### Budget Utilization
```
Utilization % = (Spent / Budget) × 100
```

## Troubleshooting Quick Fixes

### Page Not Loading
1. Refresh browser (F5)
2. Clear cache (Ctrl + Shift + Del)
3. Check internet connection
4. Try different browser

### Data Not Syncing
1. Click "Force Sync" button
2. Wait 60 seconds for auto-sync
3. Check sync status on dashboard
4. Contact support if persists

### Cannot Save Transaction
1. Verify all required fields filled
2. Check amount is valid number
3. Ensure proper permissions
4. Check internet connection

## Month-End Checklist

- [ ] Review all transactions for month
- [ ] Reconcile student accounts
- [ ] Approve pending expenses
- [ ] Update budget tracking
- [ ] Generate monthly report
- [ ] Export data for records
- [ ] Review audit logs
- [ ] Backup important documents
- [ ] Verify sync status
- [ ] Plan for next month

## Useful Tips

💡 Use filters to find transactions quickly  
💡 Add detailed descriptions for clarity  
💡 Reference invoice numbers for expenses  
💡 Tag transactions with student IDs  
💡 Generate reports before month-end  
💡 Review audit logs weekly  
💡 Keep track of outstanding fees  
💡 Monitor budget utilization regularly  

---

**Keep this card handy for quick reference!**  
**For detailed documentation, see ACCOUNTING_SYSTEM.md**

**Version:** 1.0.0  
**Last Updated:** December 2025
