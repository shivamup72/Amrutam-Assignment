/**
 * Logger & Crash Reporting Abstraction Utility
 */

class AppLogger {
  constructor() {
    this.crashLogs = [];
    this.performanceTraces = new Map();
  }

  log(level, message, meta) {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;

    if (level === 'error') {
      console.error(formatted, meta || '');
    } else if (level === 'warn') {
      console.warn(formatted, meta || '');
    } else {
      console.log(formatted, meta || '');
    }
  }

  recordCrash(error, stackTrace) {
    const crash = {
      id: Math.random().toString(36).substring(2, 9),
      error: typeof error === 'string' ? error : error.message,
      stack: stackTrace || (typeof error !== 'string' ? error.stack : undefined),
      timestamp: new Date().toISOString(),
      deviceInfo: 'React Native Application Environment',
    };
    this.crashLogs.push(crash);
    this.log('error', `CRASH REPORTED: ${crash.error}`, { crashId: crash.id });
  }

  getCrashLogs() {
    return [...this.crashLogs];
  }

  startTrace(traceName) {
    this.performanceTraces.set(traceName, performance.now());
  }

  stopTrace(traceName) {
    const startTime = this.performanceTraces.get(traceName);
    if (!startTime) return 0;
    const duration = Math.round(performance.now() - startTime);
    this.log('info', `PERF TRACE [${traceName}]: ${duration}ms`);
    this.performanceTraces.delete(traceName);
    return duration;
  }
}

export const logger = new AppLogger();
