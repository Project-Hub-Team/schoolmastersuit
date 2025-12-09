# 🏫 Ghana School Management System

A complete Progressive Web App (PWA) for managing Ghanaian schools from Pre-School to Junior High School (JHS).

## 🎯 Features

### ✅ Complete Ghana Education Structure
- **Pre-School**: Nursery 1-2, KG 1-2
- **Primary School**: Basic 1-6
- **Junior High School**: JHS 1-3

### 👥 User Roles
- **Super Admin**: Full system configuration and control
- **Admin**: School management, student/teacher management
- **Teacher**: Attendance, grading, lesson notes
- **Student**: Access to results, fees, lesson notes

### 🔑 Core Modules
1. **Authentication**: Firebase Auth with role-based access
2. **Student Management**: Registration, profiles, e-voucher system
3. **Teacher Management**: Assignment, subjects, class teachers
4. **Fees & Payments**: Real-time tracking, receipts
5. **Grading System**: GES-compliant grading (A1-F9)
6. **Attendance**: Daily tracking by class
7. **Lesson Notes**: Upload and access by class/subject
8. **Reports**: Comprehensive analytics and exports

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Firebase account
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up Firebase configuration
# Create src/config/firebase.config.js with your credentials

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Firebase Setup

1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Enable Realtime Database
4. Enable Storage
5. Deploy security rules from `/firebase/` directory
6. Deploy Cloud Functions

## 📱 PWA Features

- ✅ Offline support
- ✅ Install to home screen
- ✅ Push notifications
- ✅ Background sync
- ✅ Fast loading with caching

## 🎓 Ghana Education System Support

### Grading Scale (GES Standard)
- A1: 80-100 (Excellent)
- B2: 70-79 (Very Good)
- B3: 65-69 (Good)
- C4: 60-64 (Credit)
- C5: 55-59 (Credit)
- C6: 50-54 (Credit)
- D7: 45-49 (Pass)
- E8: 40-44 (Pass)
- F9: 0-39 (Fail)

### Subjects by Level
**Primary (Basic 1-6)**:
- English Language, Mathematics, Science, Computing, Ghanaian Language, Creative Arts, RME, History, OWOP, Physical Education

**JHS (1-3)**:
- English Language, Mathematics, Integrated Science, Social Studies, ICT, French, BDT, RME, Ghanaian Language, Creative Arts, Physical Education

## 🔐 Security

- Role-based access control (RBAC)
- Firebase security rules
- App Check enabled
- Secure authentication
- Data encryption

## 📄 License

Copyright © 2025. All rights reserved.

## 🤝 Support

For issues or questions, please contact the system administrator.
