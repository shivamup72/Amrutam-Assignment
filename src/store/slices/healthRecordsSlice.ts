/**
 * Health Records Redux Slice with Redux Toolkit Async Thunks
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { generateHealthRecords } from '../../data/mockGenerator';
import { apiClient } from '../../core/api/apiClient';

export const fetchHealthRecords = createAsyncThunk(
  'healthRecords/fetchHealthRecords',
  async (options = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.request('health_records', () => generateHealthRecords(10000), options);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch health records');
    }
  }
);

const initialState = {
  healthRecords: generateHealthRecords(10000),
  previewRecord: null,
  loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
  error: null,
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHealthRecords.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchHealthRecords.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.healthRecords = action.payload;
      })
      .addCase(fetchHealthRecords.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setPreviewRecord, setHealthRecords } = healthRecordsSlice.actions;

export default healthRecordsSlice.reducer;
