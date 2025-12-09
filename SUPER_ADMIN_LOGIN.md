# 🔐 Super Admin Login Credentials

## Active Super Admin Accounts

### 1. Homebwoy Admin ✅
- **Email:** homebwoy@school.com
- **Password:** admintest90
- **Status:** Active
- **Role:** Super Admin
- **UID:** vofEnhQUvHUO1y6O8Ej3hDT3wWG3

### 2. Nunana Admin ✅
- **Email:** eleblununana@school.com
- **Password:** NUNANA123
- **Status:** Active
- **Role:** Super Admin
- **UID:** ujtYXcDtXOQIrcZuChHpVeqBsHE3

### 3. ELEBLU NUNANA (Gmail Account)
- **Email:** eleblununana@gmail.com
- **Status:** Inactive (different account)
- **Role:** Super Admin
- **UID:** BGDrYkkGkOPSgEPHriSGO5AKAma2

---

## 🌐 Login URL
**http://localhost:5174/login**

---

## 📋 What You Can Do as Super Admin

### System Settings
- Configure school information
- Set academic year and terms
- Manage system-wide settings
- URL: http://localhost:5174/super-admin/settings

### Manage Admins
- Create new admin accounts
- View all administrators
- Manage admin permissions
- URL: http://localhost:5174/super-admin/admins

### Voucher Management
- Generate student registration vouchers
- View voucher usage
- Manage e-voucher system
- URL: http://localhost:5174/super-admin/vouchers

### Full Access
As Super Admin, you also have access to:
- All student records
- All teacher records
- All class management
- All fee management
- All reports and analytics

---

## 🚀 Next Steps

1. **Login** using either account above
2. **Configure System Settings**
   - Set your school name
   - Configure academic year (e.g., 2024/2025)
   - Set current term (Term 1, 2, or 3)
3. **Create Admin Accounts**
   - Go to Manage Admins
   - Create accounts for your school administrators
4. **Generate Student Vouchers** (optional)
   - For student self-registration
   - Or register students manually

---

## 🔧 Troubleshooting

### If Super Admin Page is Blank:
1. **Check Browser Console** (F12)
   - Look for any errors
   - Firebase connection issues?

2. **Verify Login**
   - Make sure you're logged in
   - Check that role is "super_admin"

3. **Clear Browser Cache**
   - Hard refresh: Ctrl + Shift + R
   - Or clear cache in browser settings

4. **Check Firebase Connection**
   - Database rules need to be deployed
   - Run: `firebase deploy --only database:rules`

### Firebase Security Rules Not Deployed?
```powershell
cd firebase
firebase login
firebase deploy --only database:rules,storage:rules
```

---

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify Firebase database is accessible
3. Ensure security rules are deployed
4. Check that you're using the correct credentials above

---

**Last Updated:** December 9, 2025
**System Status:** ✅ Active and Running
**Server:** http://localhost:5174
