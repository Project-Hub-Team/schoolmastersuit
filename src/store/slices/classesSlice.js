/**
 * Classes Redux Slice
 */

import { createSlice } from '@reduxjs/toolkit';
import { CLASSES } from '../../constants/ghanaEducation';

const initialState = {
  classes: CLASSES,
  selectedClass: null,
  classAssignments: {}, // { classId: { teacher, subjects, students } }
  loading: false,
  error: null
};

const classesSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    setClassAssignments: (state, action) => {
      state.classAssignments = action.payload;
    },
    updateClassAssignment: (state, action) => {
      const { classId, data } = action.payload;
      state.classAssignments[classId] = {
        ...state.classAssignments[classId],
        ...data
      };
    },
    setSelectedClass: (state, action) => {
      state.selectedClass = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setClassAssignments,
  updateClassAssignment,
  setSelectedClass,
  setLoading,
  setError,
  clearError
} = classesSlice.actions;

export default classesSlice.reducer;

// Selectors
export const selectAllClasses = (state) => state.classes.classes;
export const selectSelectedClass = (state) => state.classes.selectedClass;
export const selectClassAssignments = (state) => state.classes.classAssignments;
export const selectClassAssignment = (classId) => (state) =>
  state.classes.classAssignments[classId];
