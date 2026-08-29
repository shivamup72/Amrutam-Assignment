import { configureStore } from '@reduxjs/toolkit';
import devReducer from './slices/devSlice';
import consultationsReducer from './slices/consultationsSlice';
import shopReducer from './slices/shopSlice';
import healthRecordsReducer from './slices/healthRecordsSlice';
import { localStorage, STORAGE_KEYS } from '../storage/storage';
import { setCart, setWishlist } from './slices/shopSlice';
import { setUpcomingBookings } from './slices/consultationsSlice';
import {
  setLanguage,
  setBiometricEnabled,
  toggleDarkMode,
} from './slices/devSlice';

export const store = configureStore({
  reducer: {
    dev: devReducer,
    consultations: consultationsReducer,
    shop: shopReducer,
    healthRecords: healthRecordsReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

const persistedCart = localStorage.getItem(STORAGE_KEYS.CART);
const persistedWishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST);
const persistedBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
const persistedPreferences = localStorage.getItem(STORAGE_KEYS.PREFERENCES);

// Hydrate before React renders, so default empty state is never written over saved data.
if (Array.isArray(persistedCart)) store.dispatch(setCart(persistedCart));
if (Array.isArray(persistedWishlist))
  store.dispatch(setWishlist(persistedWishlist));
if (Array.isArray(persistedBookings))
  store.dispatch(setUpcomingBookings(persistedBookings));
if (persistedPreferences && typeof persistedPreferences === 'object') {
  if (persistedPreferences.isDarkMode === true)
    store.dispatch(toggleDarkMode());
  if (typeof persistedPreferences.language === 'string')
    store.dispatch(setLanguage(persistedPreferences.language));
  if (typeof persistedPreferences.isBiometricEnabled === 'boolean')
    store.dispatch(
      setBiometricEnabled(persistedPreferences.isBiometricEnabled),
    );
}
