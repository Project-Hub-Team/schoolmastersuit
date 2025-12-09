/**
 * Firebase Cloud Functions for Ghana School Management System
 * Deploy with: firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// ============================================
// STUDENT PROMOTION FUNCTION
// ============================================

/**
 * Automatically promote eligible students at the end of academic year
 * Trigger: Manually or scheduled
 */
exports.promoteStudents = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Verify admin role
  const userDoc = await admin.database().ref(`users/${context.auth.uid}`).once('value');
  const userRole = userDoc.val()?.role;
  
  if (userRole !== 'super_admin' && userRole !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can promote students');
  }

  const { academicYear, term } = data;
  
  try {
    const studentsSnapshot = await admin.database().ref('students').once('value');
    const students = studentsSnapshot.val();
    
    const promotions = [];
    const classMap = {
      'nursery-1': 'nursery-2',
      'nursery-2': 'kg-1',
      'kg-1': 'kg-2',
      'kg-2': 'basic-1',
      'basic-1': 'basic-2',
      'basic-2': 'basic-3',
      'basic-3': 'basic-4',
      'basic-4': 'basic-5',
      'basic-5': 'basic-6',
      'basic-6': 'jhs-1',
      'jhs-1': 'jhs-2',
      'jhs-2': 'jhs-3',
      'jhs-3': 'graduated'
    };

    for (const studentId in students) {
      const student = students[studentId];
      const currentClass = student.classId;
      const nextClass = classMap[currentClass];

      if (!nextClass) continue;

      // Get student results
      const resultsSnapshot = await admin.database()
        .ref(`results/${studentId}/${academicYear}/${term}`)
        .once('value');
      
      const results = resultsSnapshot.val();
      
      if (!results) continue;

      // Calculate average
      const scores = Object.values(results).map(r => r.totalScore);
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;

      // Check if eligible (average >= 40)
      if (average >= 40) {
        await admin.database().ref(`students/${studentId}`).update({
          classId: nextClass,
          previousClass: currentClass,
          promotedAt: Date.now(),
          promotedYear: academicYear
        });

        promotions.push({
          studentId,
          name: `${student.firstName} ${student.lastName}`,
          from: currentClass,
          to: nextClass,
          average
        });
      }
    }

    return {
      success: true,
      promotions,
      count: promotions.length
    };
  } catch (error) {
    console.error('Error promoting students:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================
// GENERATE REPORT CARD
// ============================================

/**
 * Generate comprehensive report card for a student
 */
exports.generateReportCard = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { studentId, academicYear, term } = data;

  try {
    // Get student info
    const studentSnapshot = await admin.database().ref(`students/${studentId}`).once('value');
    const student = studentSnapshot.val();

    // Get results
    const resultsSnapshot = await admin.database()
      .ref(`results/${studentId}/${academicYear}/${term}`)
      .once('value');
    const results = resultsSnapshot.val();

    // Get attendance
    const attendanceSnapshot = await admin.database()
      .ref(`attendance/${student.classId}`)
      .once('value');
    const attendanceData = attendanceSnapshot.val();

    // Calculate attendance percentage
    let totalDays = 0;
    let presentDays = 0;

    if (attendanceData) {
      for (const date in attendanceData) {
        const dayAttendance = attendanceData[date];
        if (dayAttendance[studentId]) {
          totalDays++;
          if (dayAttendance[studentId].status === 'present') {
            presentDays++;
          }
        }
      }
    }

    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Calculate overall average
    const resultArray = Object.values(results || {});
    const average = resultArray.length > 0
      ? resultArray.reduce((sum, r) => sum + r.totalScore, 0) / resultArray.length
      : 0;

    return {
      success: true,
      reportCard: {
        student,
        academicYear,
        term,
        results: resultArray,
        average: Math.round(average * 100) / 100,
        attendance: {
          presentDays,
          totalDays,
          percentage: Math.round(attendancePercentage * 100) / 100
        },
        generatedAt: Date.now()
      }
    };
  } catch (error) {
    console.error('Error generating report card:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================
// SEND NOTIFICATION
// ============================================

/**
 * Send notification to user(s)
 */
exports.sendNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, title, message, type } = data;

  try {
    const notification = {
      title,
      message,
      type: type || 'info',
      read: false,
      createdAt: Date.now()
    };

    if (userId) {
      // Send to specific user
      await admin.database().ref(`notifications/${userId}`).push(notification);
    } else {
      // Broadcast to all users
      const usersSnapshot = await admin.database().ref('users').once('value');
      const users = usersSnapshot.val();

      const promises = Object.keys(users).map(uid =>
        admin.database().ref(`notifications/${uid}`).push(notification)
      );

      await Promise.all(promises);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================
// CALCULATE CLASS STATISTICS
// ============================================

/**
 * Calculate statistics for a class
 */
exports.calculateClassStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { classId, academicYear, term } = data;

  try {
    // Get all students in class
    const studentsSnapshot = await admin.database().ref('students')
      .orderByChild('classId')
      .equalTo(classId)
      .once('value');
    
    const students = studentsSnapshot.val();
    
    if (!students) {
      return { success: true, stats: null };
    }

    const studentIds = Object.keys(students);
    const allScores = [];

    // Collect all results
    for (const studentId of studentIds) {
      const resultsSnapshot = await admin.database()
        .ref(`results/${studentId}/${academicYear}/${term}`)
        .once('value');
      
      const results = resultsSnapshot.val();
      
      if (results) {
        const scores = Object.values(results).map(r => r.totalScore);
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        allScores.push(average);
      }
    }

    // Calculate statistics
    const classAverage = allScores.length > 0
      ? allScores.reduce((a, b) => a + b, 0) / allScores.length
      : 0;
    
    const highest = allScores.length > 0 ? Math.max(...allScores) : 0;
    const lowest = allScores.length > 0 ? Math.min(...allScores) : 0;

    return {
      success: true,
      stats: {
        classId,
        totalStudents: studentIds.length,
        studentsWithResults: allScores.length,
        classAverage: Math.round(classAverage * 100) / 100,
        highest: Math.round(highest * 100) / 100,
        lowest: Math.round(lowest * 100) / 100,
        academicYear,
        term
      }
    };
  } catch (error) {
    console.error('Error calculating class stats:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================
// ON USER CREATE - SET UP PROFILE
// ============================================

/**
 * When a new user is created, set up their profile
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    await admin.database().ref(`users/${user.uid}`).set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      createdAt: Date.now(),
      lastLogin: Date.now()
    });

    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
});

// ============================================
// ON USER DELETE - CLEANUP
// ============================================

/**
 * When a user is deleted, clean up their data
 */
exports.onUserDelete = functions.auth.user().onDelete(async (user) => {
  try {
    // Delete user profile
    await admin.database().ref(`users/${user.uid}`).remove();
    
    // Delete notifications
    await admin.database().ref(`notifications/${user.uid}`).remove();

    return true;
  } catch (error) {
    console.error('Error deleting user data:', error);
    return false;
  }
});
