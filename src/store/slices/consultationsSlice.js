/**
 * Consultations Redux Slice with Redux Toolkit Async Thunks
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { generateDoctors } from '../../data/mockGenerator';
import { apiClient } from '../../core/api/apiClient';
import { offlineEngine } from '../../core/offline/offlineEngine';
import { localStorage, STORAGE_KEYS } from '../../storage/storage';

export const fetchDoctors = createAsyncThunk(
  'consultations/fetchDoctors',
  async (options = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.request(
        'doctors',
        () => generateDoctors(5000),
        options,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch doctors');
    }
  },
);

const initialState = {
  doctors: generateDoctors(5000),
  upcomingBookings: [],
  loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
  error: null,
};

const consultationsSlice = createSlice({
  name: 'consultations',
  initialState,
  reducers: {
    setDoctors: (state, action) => {
      state.doctors = action.payload;
    },
    bookConsultationSlot: (state, action) => {
      const { doctorId, slotId, isOffline } = action.payload;
      const doctor = state.doctors.find(d => d.id === doctorId);
      if (!doctor) return;

      const slot = doctor.slots.find(s => s.id === slotId);
      if (!slot) return;

      slot.isBooked = true;

      const newBooking = {
        id: `booking_${Date.now()}`,
        doctorId: doctor.id,
        slotId: slot.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        slotTime: slot.time,
        slotDate: slot.date,
        consultationFee: doctor.consultationFee,
        bookedAt: new Date().toISOString(),
        status: 'UPCOMING',
      };

      state.upcomingBookings.unshift(newBooking);

      if (isOffline) {
        offlineEngine.enqueue('BOOK_CONSULTATION', newBooking);
      }
    },
    cancelConsultationBooking: (state, action) => {
      const { bookingId, isOffline } = action.payload;
      const booking = state.upcomingBookings.find(b => b.id === bookingId);
      if (booking) {
        booking.status = 'CANCELLED';
        const doctor = state.doctors.find(item => item.id === booking.doctorId);
        const slot = doctor?.slots.find(item => item.id === booking.slotId);
        if (slot) slot.isBooked = false;
      }

      if (isOffline) {
        offlineEngine.enqueue('CANCEL_CONSULTATION', { bookingId });
      }
    },
    setUpcomingBookings: (state, action) => {
      state.upcomingBookings = Array.isArray(action.payload)
        ? action.payload
        : [];
      state.upcomingBookings.forEach(booking => {
        if (booking.status === 'CANCELLED') return;
        const doctor = state.doctors.find(item => item.id === booking.doctorId);
        const slot = doctor?.slots.find(
          item =>
            item.id === booking.slotId ||
            (item.time === booking.slotTime && item.date === booking.slotDate),
        );
        if (slot) slot.isBooked = true;
      });
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchDoctors.pending, state => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

const persistConsultationsState = state => {
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, state.upcomingBookings);
};

const consultationsReducer = (state, action) => {
  const nextState = consultationsSlice.reducer(state, action);
  if (
    [
      'consultations/bookConsultationSlot',
      'consultations/cancelConsultationBooking',
      'consultations/setUpcomingBookings',
    ].includes(action.type)
  ) {
    persistConsultationsState(nextState);
  }
  return nextState;
};

export const {
  setDoctors,
  bookConsultationSlot,
  cancelConsultationBooking,
  setUpcomingBookings,
} = consultationsSlice.actions;

export default consultationsReducer;
