# 🏫 Ghana School Management System - Deployment Guide

## 📋 Prerequisites

- Node.js 16 or higher
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created
- Git (optional, for version control)

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
cd "c:\Users\LENOVO\Desktop\SCHOOL MANAGEMENT SYSTEM"
npm install
```

### 2. Firebase Setup

#### Login to Firebase
```bash
firebase login
```

#### Initialize Firebase (if not already done)
```bash
firebase init
```

Select:
- ✅ Realtime Database
- ✅ Functions
- ✅ Hosting
- ✅ Storage

#### Deploy Firebase Security Rules
```bash
cd firebase
firebase deploy --only database:rules
firebase deploy --only storage:rules
```

#### Deploy Cloud Functions
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### 3. Configure Firebase in the App

The Firebase configuration is already set in `src/config/firebase.config.js` with your credentials:
- ✅ API Key configured
- ✅ Database URL configured
- ✅ All Firebase services initialized

### 4. Build the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
```

### 5. Deploy to Firebase Hosting

```bash
# Build first
npm run build

# Deploy
cd firebase
firebase deploy --only hosting
```

## 🔐 Security Setup

### 1. Enable Firebase Authentication

1. Go to Firebase Console → Authentication
2. Enable Email/Password sign-in method
3. (Optional) Enable other providers

### 2. Set up App Check (Recommended for Production)

1. Go to Firebase Console → App Check
2. Register your app
3. Get reCAPTCHA v3 site key
4. Uncomment App Check initialization in `src/config/firebase.config.js`

```javascript
// Uncomment these lines in firebase.config.js
if (typeof window !== 'undefined') {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
    isTokenAutoRefreshEnabled: true
  });
}
```

### 3. Set Firebase Security Rules

Security rules are already created in:
- `firebase/database.rules.json` (Realtime Database)
- `firebase/storage.rules` (Storage)

Deploy with:
```bash
firebase deploy --only database:rules,storage:rules
```

## 👤 Creating the First Super Admin

### Method 1: Manual (via Firebase Console)

1. Go to Firebase Console → Authentication
2. Add a user with email/password
3. Copy the user's UID
4. Go to Realtime Database
5. Create entry: `users/{uid}` with:
```json
{
  "uid": "USER_UID_HERE",
  "email": "admin@school.com",
  "displayName": "Super Admin",
  "role": "super_admin",
  "createdAt": 1234567890,
  "lastLogin": 1234567890
}
```

### Method 2: Using Cloud Function

Create a one-time function to create super admin, or use Firebase Admin SDK.

## 📱 PWA Installation

### For Users

1. Visit the deployed website
2. Click "Install" in the browser prompt
3. Or use browser menu → "Install Ghana SMS"

### PWA Features Included

✅ Offline support
✅ Install to home screen
✅ Push notifications (setup required)
✅ Background sync
✅ App shortcuts
✅ Caching strategy

## 🎨 Customization

### School Branding

Edit in Super Admin → System Settings:
- School name
- School logo
- Theme colors
- Contact information

### Classes & Subjects

All Ghana education structure is pre-configured:
- Nursery 1-2
- KG 1-2
- Basic 1-6
- JHS 1-3

## 🧪 Testing

### Run Development Server
```bash
npm run dev
```

### Test Cloud Functions Locally
```bash
cd firebase/functions
npm run serve
```

### Test Different Roles

Create test accounts for each role:
1. Super Admin
2. Admin
3. Teacher
4. Student

## 📊 Initial Data Setup

### 1. Configure System Settings
- Login as Super Admin
- Go to System Settings
- Set school details

### 2. Create Admins
- Go to Manage Admins
- Add administrator accounts

### 3. Register Teachers
- Go to Teachers
- Add teacher profiles
- Assign to classes

### 4. Add Students
- Register students manually, OR
- Generate e-vouchers for self-registration

### 5. Set Up Classes
- Assign class teachers
- Configure subjects per class

## 🔧 Environment Variables (Optional)

Create `.env` file for sensitive data:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
# ... other config
```

Then update `firebase.config.js` to use `import.meta.env.VITE_*`

## 📈 Monitoring

### Firebase Console
- Monitor authentication
- Check database usage
- View storage usage
- Monitor function executions

### Performance
- Enable Firebase Performance Monitoring
- Use Lighthouse for PWA audit

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Firebase Deployment Issues
```bash
# Re-initialize Firebase
firebase init

# Check Firebase project
firebase use --add
```

### Permission Errors
- Check security rules
- Verify user roles in database
- Check authentication status

## 🌐 Production Checklist

- [ ] Firebase security rules deployed
- [ ] Cloud Functions deployed
- [ ] Environment variables set
- [ ] App Check enabled
- [ ] SSL certificate (automatic with Firebase Hosting)
- [ ] Custom domain configured (optional)
- [ ] Backup strategy in place
- [ ] Super admin account created
- [ ] Test all user roles
- [ ] PWA installability tested
- [ ] Performance optimized

## 📞 Support & Maintenance

### Regular Tasks
- Monitor Firebase usage
- Review security rules
- Update dependencies
- Backup database regularly
- Review user feedback

### Updates
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit
npm audit fix
```

## 🎓 Training

Train staff on:
1. Super Admin: System configuration
2. Admin: Student/teacher management
3. Teachers: Grading, attendance, lesson notes
4. Students: Accessing results, fees, notes

## 📄 License & Credits

Ghana School Management System
© 2025 All Rights Reserved

Built with:
- React + Vite
- Firebase (Auth, Realtime DB, Storage, Functions)
- TailwindCSS
- PWA Technologies

---

**For technical support, refer to the codebase documentation or contact the system administrator.**
