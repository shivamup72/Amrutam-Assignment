import { createSlice } from '@reduxjs/toolkit';
import { localStorage, STORAGE_KEYS } from '../../storage/storage';

const initialState = {
  isDarkMode: false,
  language: 'en',
  activeTab: 'consultations',
  isOffline: false,
  isSlowNetwork: false,
  isChaosMode: false,
  simulateSessionExpired: false,
  isBiometricEnabled: true,
  isBiometricAuthenticated: false,
  toasts: [],
};

const devSlice = createSlice({
  name: 'dev',
  initialState,
  reducers: {
    toggleDarkMode: state => {
      state.isDarkMode = !state.isDarkMode;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setOffline: (state, action) => {
      state.isOffline = action.payload;
    },
    toggleSlowNetwork: state => {
      state.isSlowNetwork = !state.isSlowNetwork;
    },
    toggleChaosMode: state => {
      state.isChaosMode = !state.isChaosMode;
    },
    toggleSessionExpired: state => {
      state.simulateSessionExpired = !state.simulateSessionExpired;
    },
    toggleBiometricEnabled: state => {
      state.isBiometricEnabled = !state.isBiometricEnabled;
      if (state.isBiometricEnabled) {
        state.isBiometricAuthenticated = true;
      }
    },
    setBiometricEnabled: (state, action) => {
      state.isBiometricEnabled = Boolean(action.payload);
      state.isBiometricAuthenticated = false;
    },
    setBiometricAuthenticated: (state, action) => {
      state.isBiometricAuthenticated = action.payload;
    },
    addToast: (state, action) => {
      const { type, title, message } = action.payload;
      const id = `toast_${Date.now()}_${Math.random()}`;
      state.toasts.push({ id, type, title, message });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
  },
});

const persistPreferences = state => {
  localStorage.setItem(STORAGE_KEYS.PREFERENCES, {
    isDarkMode: state.isDarkMode,
    language: state.language,
    isBiometricEnabled: state.isBiometricEnabled,
  });
};

const devReducer = (state, action) => {
  const nextState = devSlice.reducer(state, action);
  if (
    [
      'dev/toggleDarkMode',
      'dev/setLanguage',
      'dev/toggleBiometricEnabled',
    ].includes(action.type)
  ) {
    persistPreferences(nextState);
  }
  return nextState;
};

export const {
  toggleDarkMode,
  setLanguage,
  setActiveTab,
  setOffline,
  toggleSlowNetwork,
  toggleChaosMode,
  toggleSessionExpired,
  toggleBiometricEnabled,
  setBiometricEnabled,
  setBiometricAuthenticated,
  addToast,
  removeToast,
} = devSlice.actions;

export default devReducer;
