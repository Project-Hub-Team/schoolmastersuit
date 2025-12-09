/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import studentsReducer from './slices/studentsSlice';
import teachersReducer from './slices/teachersSlice';
import classesReducer from './slices/classesSlice';
import systemReducer from './slices/systemSlice';

export const store = configureStore({
  reducer: {
    students: studentsReducer,
    teachers: teachersReducer,
    classes: classesReducer,
    system: systemReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['students/setStudents', 'teachers/setTeachers'],
      },
    }),
});
