/**
 * Standalone migration script to update existing grades
 */

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { ref, get, update } from 'firebase/database';

// Firebase config (same as in the app)
const firebaseConfig = {
  apiKey: "AIzaSyCRNfY33h_7IiBd33dQvJU6N-Z8_89QdR4",
  authDomain: "school-management-system-afc40.firebaseapp.com",
  databaseURL: "https://school-management-system-afc40-default-rtdb.firebaseio.com",
  projectId: "school-management-system-afc40",
  storageBucket: "school-management-system-afc40.firebasestorage.app",
  messagingSenderId: "596795127606",
  appId: "1:596795127606:web:996108327b84793f5fa597",
  measurementId: "G-W8N6LP1DV4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Custom functions for migration
const readAllRecords = async (path) => {
  try {
    const snapshot = await get(ref(database, path));
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    }
    return { success: false, error: 'No data found' };
  } catch (error) {
    console.error('Error reading records:', error);
    return { success: false, error: error.message };
  }
};

const updateRecord = async (path, data) => {
  try {
    await update(ref(database, path), data);
    return { success: true };
  } catch (error) {
    console.error('Error updating record:', error);
    return { success: false, error: error.message };
  }
};

const migrateGrades = async () => {
  try {
    console.log('Starting migration...');
    const gradesResult = await readAllRecords('grades');
    if (!gradesResult.success) {
      console.error('Failed to read grades');
      return;
    }

    const allGrades = gradesResult.data || {};
    const updates = [];
    let count = 0;

    for (const [gradeId, gradeData] of Object.entries(allGrades)) {
      if (!gradeData.term || !gradeData.academicYear) {
        const updatedGrade = {
          ...gradeData,
          term: gradeData.term || 'term1',
          academicYear: gradeData.academicYear || '2024-2025'
        };
        updates.push(updateRecord(`grades/${gradeId}`, updatedGrade));
        count++;
      }
    }

    if (updates.length > 0) {
      await Promise.all(updates);
      console.log(`Successfully migrated ${count} grade records`);
    } else {
      console.log('No records needed migration');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

// Run the migration
migrateGrades();