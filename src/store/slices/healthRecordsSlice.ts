import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getHealthRecords } from '../../services/healthRecordService';

export const fetchHealthRecords = createAsyncThunk(
  'healthRecords/fetchHealthRecords',
  async (options: any = {}, { rejectWithValue }) => {
    try {
      const response = await getHealthRecords(options);
      return {
        ...response,
        reset: !!options.reset || (options.page || 1) === 1,
      };
    } catch (err: any) {
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
          const existingIds = new Set(state.healthRecords.map((r: any) => r.id));
          const filteredNew = newRecords.filter((r: any) => !existingIds.has(r.id));
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
