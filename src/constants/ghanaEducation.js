/**
 * Ghana Education System Constants
 * Based on Ghana Education Service (GES) Standards
 */

// ============================================
// CLASS STRUCTURE
// ============================================

export const CLASS_LEVELS = {
  PRESCHOOL: 'PRESCHOOL',
  PRIMARY: 'PRIMARY',
  JHS: 'JHS'
};

export const CLASSES = [
  // Pre-School
  { id: 'nursery-1', name: 'Nursery 1', level: CLASS_LEVELS.PRESCHOOL, order: 1 },
  { id: 'nursery-2', name: 'Nursery 2', level: CLASS_LEVELS.PRESCHOOL, order: 2 },
  { id: 'kg-1', name: 'KG 1', level: CLASS_LEVELS.PRESCHOOL, order: 3 },
  { id: 'kg-2', name: 'KG 2', level: CLASS_LEVELS.PRESCHOOL, order: 4 },
  
  // Primary School (Basic 1-6)
  { id: 'basic-1', name: 'Basic 1', level: CLASS_LEVELS.PRIMARY, order: 5 },
  { id: 'basic-2', name: 'Basic 2', level: CLASS_LEVELS.PRIMARY, order: 6 },
  { id: 'basic-3', name: 'Basic 3', level: CLASS_LEVELS.PRIMARY, order: 7 },
  { id: 'basic-4', name: 'Basic 4', level: CLASS_LEVELS.PRIMARY, order: 8 },
  { id: 'basic-5', name: 'Basic 5', level: CLASS_LEVELS.PRIMARY, order: 9 },
  { id: 'basic-6', name: 'Basic 6', level: CLASS_LEVELS.PRIMARY, order: 10 },
  
  // Junior High School
  { id: 'jhs-1', name: 'JHS 1', level: CLASS_LEVELS.JHS, order: 11 },
  { id: 'jhs-2', name: 'JHS 2', level: CLASS_LEVELS.JHS, order: 12 },
  { id: 'jhs-3', name: 'JHS 3', level: CLASS_LEVELS.JHS, order: 13 }
];

// ============================================
// SUBJECTS BY LEVEL
// ============================================

export const PRESCHOOL_SUBJECTS = [
  { id: 'literacy', name: 'Literacy' },
  { id: 'numeracy', name: 'Numeracy' },
  { id: 'creative-arts', name: 'Creative Arts' },
  { id: 'our-world', name: 'Our World Our People' },
  { id: 'physical-education', name: 'Physical Education' }
];

export const PRIMARY_SUBJECTS = [
  { id: 'english', name: 'English Language' },
  { id: 'mathematics', name: 'Mathematics' },
  { id: 'science', name: 'Science' },
  { id: 'computing', name: 'Computing' },
  { id: 'ghanaian-language', name: 'Ghanaian Language' },
  { id: 'creative-arts', name: 'Creative Arts' },
  { id: 'rme', name: 'Religious and Moral Education (RME)' },
  { id: 'history', name: 'History' },
  { id: 'owop', name: 'Our World Our People (OWOP)' },
  { id: 'physical-education', name: 'Physical Education' }
];

export const JHS_SUBJECTS = [
  { id: 'english', name: 'English Language' },
  { id: 'mathematics', name: 'Mathematics' },
  { id: 'integrated-science', name: 'Integrated Science' },
  { id: 'social-studies', name: 'Social Studies' },
  { id: 'ict', name: 'Information and Communication Technology (ICT)' },
  { id: 'french', name: 'French' },
  { id: 'bdt', name: 'Basic Design and Technology (BDT)' },
  { id: 'rme', name: 'Religious and Moral Education (RME)' },
  { id: 'ghanaian-language', name: 'Ghanaian Language' },
  { id: 'creative-arts', name: 'Creative Arts' },
  { id: 'physical-education', name: 'Physical Education' }
];

// Helper function to get subjects by class
export const getSubjectsByClass = (classId) => {
  const classInfo = CLASSES.find(c => c.id === classId);
  if (!classInfo) return [];
  
  switch (classInfo.level) {
    case CLASS_LEVELS.PRESCHOOL:
      return PRESCHOOL_SUBJECTS;
    case CLASS_LEVELS.PRIMARY:
      return PRIMARY_SUBJECTS;
    case CLASS_LEVELS.JHS:
      return JHS_SUBJECTS;
    default:
      return [];
  }
};

// ============================================
// GRADING SYSTEM (GES STANDARD)
// ============================================

export const GRADING_SCALE = [
  { grade: 'A1', min: 80, max: 100, remark: 'Excellent', points: 1 },
  { grade: 'B2', min: 70, max: 79, remark: 'Very Good', points: 2 },
  { grade: 'B3', min: 65, max: 69, remark: 'Good', points: 3 },
  { grade: 'C4', min: 60, max: 64, remark: 'Credit', points: 4 },
  { grade: 'C5', min: 55, max: 59, remark: 'Credit', points: 5 },
  { grade: 'C6', min: 50, max: 54, remark: 'Credit', points: 6 },
  { grade: 'D7', min: 45, max: 49, remark: 'Pass', points: 7 },
  { grade: 'E8', min: 40, max: 44, remark: 'Pass', points: 8 },
  { grade: 'F9', min: 0, max: 39, remark: 'Fail', points: 9 }
];

// Helper function to get grade from score
export const getGrade = (score) => {
  const numScore = parseFloat(score);
  if (isNaN(numScore) || numScore < 0 || numScore > 100) return null;
  
  const gradeInfo = GRADING_SCALE.find(g => numScore >= g.min && numScore <= g.max);
  return gradeInfo || null;
};

// ============================================
// ASSESSMENT STRUCTURE
// ============================================

export const ASSESSMENT_TYPES = {
  // For Primary/Preschool
  CLASSWORK: { id: 'classwork', name: 'Class Work', weight: 20 },
  HOMEWORK: { id: 'homework', name: 'Home Work', weight: 10 },
  PROJECT: { id: 'project', name: 'Project', weight: 10 },
  CLASS_TEST: { id: 'class_test', name: 'Class Test', weight: 20 },
  EXAM: { id: 'exam', name: 'Examination', weight: 40 },
  
  // For JHS
  CLASS_SCORE: { id: 'class_score', name: 'Class Score', weight: 30 },
  EXAM_SCORE: { id: 'exam_score', name: 'Exam Score', weight: 70 }
};

// ============================================
// ACADEMIC TERMS
// ============================================

export const TERMS = [
  { id: 'term-1', name: 'First Term', shortName: 'Term 1' },
  { id: 'term-2', name: 'Second Term', shortName: 'Term 2' },
  { id: 'term-3', name: 'Third Term', shortName: 'Term 3' }
];

// ============================================
// USER ROLES
// ============================================

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent'
};

// ============================================
// ATTENDANCE STATUS
// ============================================

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused'
};

// ============================================
// PAYMENT STATUS
// ============================================

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PARTIAL: 'partial',
  PENDING: 'pending',
  OVERDUE: 'overdue'
};

// ============================================
// GENDER
// ============================================

export const GENDER = {
  MALE: 'male',
  FEMALE: 'female'
};

// ============================================
// PROMOTION RULES
// ============================================

// Get next class for promotion
export const getNextClass = (currentClassId) => {
  const currentClass = CLASSES.find(c => c.id === currentClassId);
  if (!currentClass) return null;
  
  const nextClass = CLASSES.find(c => c.order === currentClass.order + 1);
  return nextClass || null;
};

// Check if student is eligible for promotion
export const isEligibleForPromotion = (studentResults) => {
  // Basic promotion criteria: Average score >= 40% (E8 or better)
  if (!studentResults || studentResults.length === 0) return false;
  
  const totalScore = studentResults.reduce((sum, result) => sum + result.totalScore, 0);
  const average = totalScore / studentResults.length;
  
  return average >= 40;
};

// ============================================
// DATABASE PATHS
// ============================================

export const DB_PATHS = {
  USERS: 'users',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  ADMINS: 'admins',
  CLASSES: 'classes',
  SUBJECTS: 'subjects',
  ATTENDANCE: 'attendance',
  RESULTS: 'results',
  FEES: 'fees',
  PAYMENTS: 'payments',
  LESSON_NOTES: 'lessonNotes',
  VOUCHERS: 'vouchers',
  SYSTEM_SETTINGS: 'systemSettings',
  NOTIFICATIONS: 'notifications'
};
