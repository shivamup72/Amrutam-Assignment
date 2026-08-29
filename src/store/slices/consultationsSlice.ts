import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDoctors } from '../../services/consultationService';
import { offlineEngine } from '../../core/offline/offlineEngine';
import { localStorage, STORAGE_KEYS } from '../../storage/storage';

export const fetchDoctors = createAsyncThunk(
  'consultations/fetchDoctors',
  async (options: any = {}, { rejectWithValue }) => {
    try {
      const response = await getDoctors(options);
      return {
        ...response,
        reset: !!options.reset || (options.page || 1) === 1,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch doctors');
    }
  },
);

const initialState = {
  doctors: [],
  upcomingBookings: [],
  loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
  error: null,
  hasNextPage: true,
  page: 1,
  total: 0,
};

const consultationsSlice = createSlice({
  name: 'consultations',
  initialState,
  reducers: {
    setDoctors: (state, action) => {
      state.doctors = action.payload;
    },
    resetDoctorsState: (state) => {
      state.doctors = [];
      state.loading = 'idle';
      state.error = null;
      state.hasNextPage = true;
      state.page = 1;
      state.total = 0;
    },
    bookConsultationSlot: (state, action) => {
      const { doctorId, slotId, isOffline } = action.payload;
      const doctor = state.doctors.find((d: any) => d.id === doctorId);
      if (!doctor) return;

      const slot = doctor.slots.find((s: any) => s.id === slotId);
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
      const booking = state.upcomingBookings.find((b: any) => b.id === bookingId);
      if (booking) {
        booking.status = 'CANCELLED';
        const doctor = state.doctors.find((item: any) => item.id === booking.doctorId);
        const slot = doctor?.slots.find((item: any) => item.id === booking.slotId);
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
      state.upcomingBookings.forEach((booking: any) => {
        if (booking.status === 'CANCELLED') return;
        const doctor = state.doctors.find((item: any) => item.id === booking.doctorId);
        const slot = doctor?.slots.find(
          (item: any) =>
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
        const newDoctors = action.payload.data || [];
        if (action.payload.reset || action.payload.page === 1) {
          state.doctors = newDoctors;
        } else {
          const existingIds = new Set(state.doctors.map((d: any) => d.id));
          const filteredNew = newDoctors.filter((d: any) => !existingIds.has(d.id));
          state.doctors.push(...filteredNew);
        }
        state.hasNextPage = action.payload.hasNextPage;
        state.page = action.payload.page;
        state.total = action.payload.total;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

const persistConsultationsState = (state: any) => {
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, state.upcomingBookings);
};

const consultationsReducer = (state: any, action: any) => {
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
  resetDoctorsState,
  bookConsultationSlot,
  cancelConsultationBooking,
  setUpcomingBookings,
} = consultationsSlice.actions;

export default consultationsReducer;
