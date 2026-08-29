/**
 * Environment & Feature Configuration for Amrutam Ayurvedic Super App
 */

export const ENV_CONFIG = {
  envName: 'production',
  apiBaseUrl: 'https://api.amrutam.co.in/v1',
  enableAnalytics: true,
  enableCrashReporting: true,
  mockNetworkDelayMs: 300,
};

export const DEFAULT_FEATURE_FLAGS = {
  enableTeleConsultation: true,
  enableDynamicDiscounts: true,
  enableAttachmentOCR: true,
  enableOfflineSync: true,
  enableHindiLanguage: true,
  enableDarkMode: true,
};
