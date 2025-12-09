/**
 * Teachers Redux Slice
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  teachers: [],
  selectedTeacher: null,
  loading: false,
  error: null
};

const teachersSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {
    setTeachers: (state, action) => {
      state.teachers = action.payload;
    },
    addTeacher: (state, action) => {
      state.teachers.push(action.payload);
    },
    updateTeacher: (state, action) => {
      const index = state.teachers.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.teachers[index] = { ...state.teachers[index], ...action.payload };
      }
    },
    removeTeacher: (state, action) => {
      state.teachers = state.teachers.filter(t => t.id !== action.payload);
    },
    setSelectedTeacher: (state, action) => {
      state.selectedTeacher = action.payload;
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
  setTeachers,
  addTeacher,
  updateTeacher,
  removeTeacher,
  setSelectedTeacher,
  setLoading,
  setError,
  clearError
} = teachersSlice.actions;

export default teachersSlice.reducer;

// Selectors
export const selectAllTeachers = (state) => state.teachers.teachers;
export const selectSelectedTeacher = (state) => state.teachers.selectedTeacher;
export const selectTeachersLoading = (state) => state.teachers.loading;
export const selectTeachersError = (state) => state.teachers.error;
