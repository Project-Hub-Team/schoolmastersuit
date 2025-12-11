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
- **Accountant**: Complete accounting and financial management
- **Teacher**: Attendance, grading, lesson notes
- **Student**: Access to results, fees, lesson notes

### 🔑 Core Modules
1. **Authentication**: Firebase Auth with role-based access
2. **Student Management**: Registration, profiles, e-voucher system
3. **Teacher Management**: Assignment, subjects, class teachers
4. **Accounting System**: Separate database, transactions, fees, expenses, budgets
5. **Fees & Payments**: Real-time tracking, receipts
6. **Grading System**: GES-compliant grading (A1-F9)
7. **Attendance**: Daily tracking by class
8. **Lesson Notes**: Upload and access by class/subject
9. **Reports**: Comprehensive analytics and exports

## 💰 Accounting System

### Features
- **Separate Database**: Independent accounting database with bi-directional sync
- **Transaction Management**: Income and expense tracking
- **Fee Management**: Configure and manage school fees
- **Expense Tracking**: Record and approve expenses
- **Budget Management**: Create and monitor budgets
- **Student Accounts**: Individual account balances and payment history
- **Financial Reports**: Comprehensive reporting and analytics
- **Audit Logs**: Complete audit trail of all financial activities

### Database Synchronization
- Real-time bidirectional sync between accounting and main database
- Automated conflict resolution
- Data integrity verification
- Manual sync triggers available

For detailed accounting documentation, see [ACCOUNTING_SYSTEM.md](./ACCOUNTING_SYSTEM.md)  
For accountant setup guide, see [ACCOUNTANT_SETUP.md](./ACCOUNTANT_SETUP.md)

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
