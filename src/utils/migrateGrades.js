/**
 * Migration script to update existing grades with term and academicYear
 */

import { readAllRecords, updateRecord } from './database';

export const migrateGrades = async () => {
  try {
    const gradesResult = await readAllRecords('grades');
    if (!gradesResult.success) {
      console.error('Failed to read grades');
      return;
    }

    const allGrades = gradesResult.data || {};
    const updates = [];

    for (const [gradeId, gradeData] of Object.entries(allGrades)) {
      if (!gradeData.term || !gradeData.academicYear) {
        // Assume default values - you may need to adjust these
        const updatedGrade = {
          ...gradeData,
          term: gradeData.term || 'term1', // Default to term1
          academicYear: gradeData.academicYear || '2024-2025' // Default to 2024-2025
        };
        updates.push(updateRecord(`grades/${gradeId}`, updatedGrade));
      }
    }

    await Promise.all(updates);
    console.log(`Migrated ${updates.length} grade records`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
};