/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import studentsReducer from './slices/studentsSlice';
import teachersReducer from './slices/teachersSlice';
import classesReducer from './slices/classesSlice';
import systemReducer from './slices/systemSlice';
import accountingReducer from './slices/accountingSlice';

export const store = configureStore({
  reducer: {
    students: studentsReducer,
    teachers: teachersReducer,
    classes: classesReducer,
    system: systemReducer,
    accounting: accountingReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['students/setStudents', 'teachers/setTeachers'],
      },
    }),
});
