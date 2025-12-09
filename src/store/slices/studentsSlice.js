/**
 * Students Redux Slice
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  students: [],
  selectedStudent: null,
  loading: false,
  error: null
};

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    setStudents: (state, action) => {
      state.students = action.payload;
    },
    addStudent: (state, action) => {
      state.students.push(action.payload);
    },
    updateStudent: (state, action) => {
      const index = state.students.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.students[index] = { ...state.students[index], ...action.payload };
      }
    },
    removeStudent: (state, action) => {
      state.students = state.students.filter(s => s.id !== action.payload);
    },
    setSelectedStudent: (state, action) => {
      state.selectedStudent = action.payload;
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
  setStudents,
  addStudent,
  updateStudent,
  removeStudent,
  setSelectedStudent,
  setLoading,
  setError,
  clearError
} = studentsSlice.actions;

export default studentsSlice.reducer;

// Selectors
export const selectAllStudents = (state) => state.students.students;
export const selectSelectedStudent = (state) => state.students.selectedStudent;
export const selectStudentsLoading = (state) => state.students.loading;
export const selectStudentsError = (state) => state.students.error;
export const selectStudentsByClass = (classId) => (state) =>
  state.students.students.filter(s => s.classId === classId);
