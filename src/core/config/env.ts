export const env = {
    apiBaseUrl: process.env.API_BASE_URL || 'https://api.example.com',
    apiTimeoutMs: Number(process.env.API_TIMEOUT_MS || 8000),
    enablePerformanceTracing: process.env.ENABLE_PERFORMANCE_TRACING !== 'false',
} as const;