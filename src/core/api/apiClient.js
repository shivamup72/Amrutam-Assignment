/**
 * API Abstraction Layer with Caching, Reliability, Timeout, Chaos/Failure Injection
 */

import { logger } from '../logger/logger';

export class ApiClient {
  constructor() {
    this.cache = new Map();
    this.cacheTTLMs = 5 * 60 * 1000;

    // Simulation flags controlled by Dev Control Deck / Redux
    this.isOffline = false;
    this.isSlowNetwork = false;
    this.isChaosMode = false;
    this.simulateSessionExpired = false;
  }

  async request(endpoint, fetcherFn, options = {}) {
    const { useCache = true, timeoutMs = 8000, bypassChaos = false } = options;
    logger.startTrace(`API_${endpoint}`);

    // Check offline status
    if (this.isOffline) {
      if (useCache && this.cache.has(endpoint)) {
        logger.log('info', `[API] Offline mode active. Returning cached data for ${endpoint}`);
        const cached = this.cache.get(endpoint);
        logger.stopTrace(`API_${endpoint}`);
        return {
          data: cached.data,
          status: 200,
          message: 'Returned cached data (Offline mode)',
          isCached: true,
        };
      }
      logger.log('warn', `[API] Network unavailable for ${endpoint}`);
      logger.stopTrace(`API_${endpoint}`);
      throw new Error('Network Error: Offline mode is active and no cache available.');
    }

    // Check simulated session expiration
    if (this.simulateSessionExpired && !bypassChaos) {
      logger.log('error', `[API] Session expired on endpoint ${endpoint}`);
      logger.stopTrace(`API_${endpoint}`);
      throw new Error('401 Unauthorized: Session has expired. Please re-authenticate.');
    }

    // Simulated Chaos Failure injection if enabled
    if (this.isChaosMode && !bypassChaos) {
      const randomOutcome = Math.random();
      if (randomOutcome < 0.25) {
        throw new Error('500 Internal Server Error: Random API chaos simulated.');
      } else if (randomOutcome < 0.40) {
        throw new Error('SyntaxError: Unexpected token < in JSON at position 0 (Invalid JSON simulation)');
      }
    }

    // Network latency simulation
    const delay = this.isSlowNetwork ? 1800 : 150;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Handle Timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`API Timeout: Request to ${endpoint} exceeded ${timeoutMs}ms`)), timeoutMs)
    );

    try {
      const data = await Promise.race([Promise.resolve(fetcherFn()), timeoutPromise]);

      // Partial response chaos handling
      if (this.isChaosMode && Array.isArray(data) && !bypassChaos && Math.random() < 0.3) {
        const partialData = data.slice(0, Math.max(1, Math.floor(data.length / 2)));
        logger.log('warn', `[API] Partial response returned for ${endpoint}`);
        return {
          data: partialData,
          status: 206,
          message: 'Partial content returned due to simulated network degradation',
          isPartial: true,
        };
      }

      // Cache successful response
      if (useCache) {
        this.cache.set(endpoint, { data, timestamp: Date.now() });
      }

      logger.stopTrace(`API_${endpoint}`);
      return {
        data,
        status: 200,
        message: 'Success',
        isCached: false,
      };
    } catch (error) {
      logger.stopTrace(`API_${endpoint}`);
      const errMessage = error instanceof Error ? error.message : 'Unknown API failure';
      logger.log('error', `[API Failure] ${endpoint}: ${errMessage}`);
      throw error;
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

export const apiClient = new ApiClient();
