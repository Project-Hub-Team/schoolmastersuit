/**
 * System Settings Redux Slice
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  settings: {
    schoolName: 'ALMA - Administrative & Learning Management Architecture',
    schoolAddress: '',
    schoolPhone: '',
    schoolEmail: '',
    schoolLogo: '',
    academicYear: '',
    currentTerm: '',
    enableVouchers: true,
    enablePayments: true,
    enableLessonNotes: true,
    enableAttendance: true,
    enableResults: true,
    themeColor: '#10b981'
  },
  loading: false,
  error: null
};

const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    updateSetting: (state, action) => {
      const { key, value } = action.payload;
      state.settings[key] = value;
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
  setSettings,
  updateSetting,
  setLoading,
  setError,
  clearError
} = systemSlice.actions;

export default systemSlice.reducer;

// Selectors
export const selectSettings = (state) => state.system.settings;
export const selectSetting = (key) => (state) => state.system.settings[key];
export const selectSystemLoading = (state) => state.system.loading;
export const selectSystemError = (state) => state.system.error;
