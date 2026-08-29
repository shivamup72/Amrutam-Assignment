export const env = {
    isMockApi: true,
    apiTimeoutMs: Number(process.env.API_TIMEOUT_MS || 8000),
    enablePerformanceTracing: process.env.ENABLE_PERFORMANCE_TRACING !== 'false',
} as const;