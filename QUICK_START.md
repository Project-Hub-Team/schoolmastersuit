# 🚀 Quick Start Guide - Ghana School Management System

## ⚡ Fast Setup (5 Minutes)

### 1. Install Dependencies
```powershell
npm install
```

### 2. Run Development Server
```powershell
npm run dev
```

The app will open at `http://localhost:5173`

### 3. First Login

The Firebase configuration is already set up with your credentials!

**Create your first Super Admin account:**
1. Go to the app
2. Click "Admin Registration"
3. Fill in details
4. After registration, manually update the user's role in Firebase Console:
   - Go to Firebase Console → Realtime Database
   - Find `users/{your-uid}`
   - Set `role: "super_admin"`

## 📁 Key Files You Need to Know

| File | Purpose |
|------|---------|
| `src/config/firebase.config.js` | ✅ Firebase configuration (already set!) |
| `src/constants/ghanaEducation.js` | Ghana class structure & grading |
| `firebase/database.rules.json` | Database security rules |
| `firebase/storage.rules` | Storage security rules |
| `firebase/functions/index.js` | Cloud Functions |

## 🎯 Testing Different Roles

Create test accounts for:

1. **Super Admin** - Full system control
2. **Admin** - School management
3. **Teacher** - Class & grading
4. **Student** - View results & fees

## 🔧 Development Commands

```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔥 Firebase Commands

```powershell
# Login to Firebase
firebase login

# Deploy security rules
cd firebase
firebase deploy --only database:rules,storage:rules

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy to hosting
npm run build
firebase deploy --only hosting
```

## 📱 Test PWA Features

1. Build the app: `npm run build`
2. Preview: `npm run preview`
3. Open in browser
4. Click install prompt or use browser menu

## 🎨 Customize School Branding

After logging in as Super Admin:
1. Go to **System Settings**
2. Update:
   - School Name
   - School Logo
   - Contact Info
   - Theme Colors

## 📊 Initial Data Setup Order

1. ✅ Create Super Admin account
2. ✅ Login as Super Admin
3. ✅ Configure System Settings
4. ✅ Create Admin accounts
5. ✅ Register Teachers
6. ✅ Assign Teachers to Classes
7. ✅ Register Students (or generate vouchers)
8. ✅ Start using the system!

## 🐛 Common Issues & Fixes

### "Firebase not initialized"
- Check `src/config/firebase.config.js` has your credentials ✅ (Already done!)

### "Permission denied"
- Deploy security rules: `firebase deploy --only database:rules`
- Check user role in database

### Build errors
```powershell
# Clear and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Firebase deployment errors
```powershell
# Re-login
firebase login

# Check project
firebase use --add
```

## 📚 Ghana Education Structure (Pre-configured)

### Pre-School
- Nursery 1, Nursery 2
- KG 1, KG 2

### Primary (Basic 1-6)
- Basic 1 → Basic 2 → Basic 3
- Basic 4 → Basic 5 → Basic 6

### JHS
- JHS 1 → JHS 2 → JHS 3

### Grading (GES Standard)
- A1: 80-100 (Excellent)
- B2: 70-79 (Very Good)
- B3: 65-69 (Good)
- C4-C6: 50-64 (Credit)
- D7-E8: 40-49 (Pass)
- F9: 0-39 (Fail)

## 🔐 Security Features

✅ Role-based access control
✅ Firebase Authentication
✅ Database security rules
✅ Storage security rules
✅ Protected routes
✅ Secure Cloud Functions
✅ App Check ready

## 📞 Need Help?

Check these files:
- `README.md` - Overview
- `DEPLOYMENT.md` - Full deployment guide
- `PROJECT_STRUCTURE.md` - Complete structure

## 🎉 You're Ready!

The complete Ghana School Management System is set up with:
- ✅ Full Ghana education structure
- ✅ Role-based dashboards
- ✅ GES-compliant grading
- ✅ PWA capabilities
- ✅ Firebase integration
- ✅ Security rules
- ✅ Cloud Functions

**Start developing and customizing!** 🚀
