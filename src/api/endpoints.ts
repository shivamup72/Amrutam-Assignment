export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  PRODUCTS: {
    BASE: '/products',
    BY_ID: (id: string) => `/products/${id}`,
  },
  DOCTORS: {
    BASE: '/doctors',
    BY_ID: (id: string) => `/doctors/${id}`,
    SLOTS: (id: string) => `/doctors/${id}/slots`,
  },
  HEALTH_RECORDS: {
    BASE: '/health_records',
    BY_ID: (id: string) => `/health_records/${id}`,
  },
};
