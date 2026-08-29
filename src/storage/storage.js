import { MMKV } from 'react-native-mmkv';

export const STORAGE_KEYS = {
  CART: 'cart',
  WISHLIST: 'wishlist',
  BOOKINGS: 'bookings',
  PREFERENCES: 'preferences',
};

let storage;

try {
  storage = new MMKV({ id: 'amrutam-local-storage' });
} catch (error) {
  // Keep unit tests and unsupported environments usable without native MMKV.
  const fallback = new Map();
  storage = {
    set: (key, value) => fallback.set(key, value),
    getString: key => fallback.get(key),
    delete: key => fallback.delete(key),
    clearAll: () => fallback.clear(),
  };
}

export const localStorage = {
  setItem(key, value) {
    try {
      storage.set(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  },

  getItem(key) {
    try {
      const value = storage.getString(key);
      if (value === undefined || value === null) return null;
      return JSON.parse(value);
    } catch (error) {
      storage.delete(key);
      return null;
    }
  },

  removeItem(key) {
    try {
      storage.delete(key);
      return true;
    } catch (error) {
      return false;
    }
  },

  clearAll() {
    try {
      storage.clearAll();
      return true;
    } catch (error) {
      return false;
    }
  },
};
