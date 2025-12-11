/**
 * Accounting Redux Slice
 * State management for accounting module
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getFeeStructures,
  getExpenses,
  getBudgets,
  getFinancialSummary,
  getAccountReceivables
} from '../../utils/accounting.database';

// Async Thunks
export const fetchTransactions = createAsyncThunk(
  'accounting/fetchTransactions',
  async (filters = {}) => {
    const result = await getTransactions(filters);
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error);
  }
);

export const addTransaction = createAsyncThunk(
  'accounting/addTransaction',
  async (transactionData) => {
    const result = await createTransaction(transactionData);
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error);
  }
);

export const editTransaction = createAsyncThunk(
  'accounting/editTransaction',
  async ({ id, updates }) => {
    const result = await updateTransaction(id, updates);
    if (result.success) {
      return { id, ...updates };
    }
    throw new Error(result.error);
  }
);

export const removeTransaction = createAsyncThunk(
  'accounting/removeTransaction',
  async (id) => {
    const result = await deleteTransaction(id);
    if (result.success) {
      return id;
    }
    throw new Error(result.error);
  }
);

export const fetchFeeStructures = createAsyncThunk(
  'accounting/fetchFeeStructures',
  async (filters = {}) => {
    const result = await getFeeStructures(filters);
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error);
  }
);

export const fetchExpenses = createAsyncThunk(
  'accounting/fetchExpenses',
  async (filters = {}) => {
    const result = await getExpenses(filters);
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error);
  }
);

export const fetchBudgets = createAsyncThunk(
  'accounting/fetchBudgets',
  async (filters = {}) => {
    const result = await getBudgets(filters);
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error);
  }
);

export const fetchFinancialSummary = createAsyncThunk(
  'accounting/fetchFinancialSummary',
  async ({ startDate, endDate }) => {
    const result = await getFinancialSummary(startDate, endDate);
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error);
  }
);

export const fetchReceivables = createAsyncThunk(
  'accounting/fetchReceivables',
  async () => {
    const result = await getAccountReceivables();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error);
  }
);

// Initial State
const initialState = {
  transactions: [],
  feeStructures: [],
  expenses: [],
  budgets: [],
  receivables: [],
  financialSummary: null,
  loading: false,
  error: null,
  filters: {
    type: '',
    status: '',
    startDate: '',
    endDate: ''
  }
};

// Slice
const accountingSlice = createSlice({
  name: 'accounting',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
      })
      .addCase(editTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = { ...state.transactions[index], ...action.payload };
        }
      })
      .addCase(removeTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(t => t.id !== action.payload);
      });

    // Fee Structures
    builder
      .addCase(fetchFeeStructures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeeStructures.fulfilled, (state, action) => {
        state.loading = false;
        state.feeStructures = action.payload;
      })
      .addCase(fetchFeeStructures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Expenses
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Budgets
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Financial Summary
    builder
      .addCase(fetchFinancialSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinancialSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.financialSummary = action.payload;
      })
      .addCase(fetchFinancialSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Receivables
    builder
      .addCase(fetchReceivables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReceivables.fulfilled, (state, action) => {
        state.loading = false;
        state.receivables = action.payload;
      })
      .addCase(fetchReceivables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setFilters, clearFilters, clearError } = accountingSlice.actions;

export default accountingSlice.reducer;
