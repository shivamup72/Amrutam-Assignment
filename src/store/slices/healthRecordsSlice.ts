/**
 * Health Records Redux Slice with Redux Toolkit Async Thunks
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchFilteredHealthRecords } from '../../data/mockGenerator';
import { apiClient } from '../../core/api/apiClient';

export const fetchHealthRecords = createAsyncThunk(
  'healthRecords/fetchHealthRecords',
  async (options = {}, { rejectWithValue }) => {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const search = options.search || '';
      const category = options.category || '';
      const response = await apiClient.request(
        `health_records?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`,
        () => fetchFilteredHealthRecords({ page, limit, search, category }),
        options,
      );
      return {
        data: response.data.data || [],
        total: response.data.total || 0,
        page: response.data.page || page,
        limit: response.data.limit || limit,
        totalPages: response.data.totalPages || 0,
        hasNextPage: !!response.data.hasNextPage,
        reset: !!options.reset || page === 1,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch health records');
    }
  }
);

const initialState = {
  healthRecords: [],
  previewRecord: null,
  loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
  error: null,
  hasNextPage: true,
  page: 1,
  total: 0,
};

const healthRecordsSlice = createSlice({
  name: 'healthRecords',
  initialState,
  reducers: {
    setPreviewRecord: (state, action) => {
      state.previewRecord = action.payload;
    },
    setHealthRecords: (state, action) => {
      state.healthRecords = action.payload;
    },
    resetHealthRecordsState: (state) => {
      state.healthRecords = [];
      state.loading = 'idle';
      state.error = null;
      state.hasNextPage = true;
      state.page = 1;
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHealthRecords.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchHealthRecords.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        const newRecords = action.payload.data || [];
        if (action.payload.reset || action.payload.page === 1) {
          state.healthRecords = newRecords;
        } else {
          const existingIds = new Set(state.healthRecords.map((r) => r.id));
          const filteredNew = newRecords.filter((r) => !existingIds.has(r.id));
          state.healthRecords.push(...filteredNew);
        }
        state.hasNextPage = action.payload.hasNextPage;
        state.page = action.payload.page;
        state.total = action.payload.total;
      })
      .addCase(fetchHealthRecords.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setPreviewRecord, setHealthRecords, resetHealthRecordsState } = healthRecordsSlice.actions;

export default healthRecordsSlice.reducer;

