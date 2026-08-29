import { logger } from '../core/logger/logger';
import { env } from '../core/config/env';

export interface RequestOptions {
  useCache?: boolean;
  timeoutMs?: number;
  bypassChaos?: boolean;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message: string;
  isCached?: boolean;
  isPartial?: boolean;
}

export class ApiClient {
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTTLMs: number;
  public baseUrl: string;
  private authToken: string | null;

  // Simulation flags for Dev Control Deck & Integration Testing
  public isOffline: boolean;
  public isSlowNetwork: boolean;
  public isChaosMode: boolean;
  public simulateSessionExpired: boolean;

  constructor() {
    this.cache = new Map();
    this.cacheTTLMs = 5 * 60 * 1000;
    this.baseUrl = 'mock://api.amrutam.local';
    this.authToken = null;

    this.isOffline = false;
    this.isSlowNetwork = false;
    this.isChaosMode = false;
    this.simulateSessionExpired = false;
  }

  /**
   * Set Centralized Authentication Token
   */
  public setAuthToken(token: string | null) {
    this.authToken = token;
  }

  /**
   * Get Centralized Request Headers
   */
  public getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...customHeaders,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Core Mock Request Processor with Caching, Reliability, Delay & Simulation
   */
  public async request<T = any>(
    endpoint: string,
    fetcherFn: () => Promise<T> | T,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { useCache = true, timeoutMs = env.apiTimeoutMs, bypassChaos = false } = options;
    logger.startTrace(`API_${endpoint}`);

    // 1. Check Offline Status
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

    // 2. Check Simulated Session Expiration
    if (this.simulateSessionExpired && !bypassChaos) {
      logger.log('error', `[API] Session expired on endpoint ${endpoint}`);
      logger.stopTrace(`API_${endpoint}`);
      throw new Error('401 Unauthorized: Session has expired. Please re-authenticate.');
    }

    // 3. Simulated Chaos Failure Injection
    if (this.isChaosMode && !bypassChaos) {
      const randomOutcome = Math.random();
      if (randomOutcome < 0.25) {
        throw new Error('500 Internal Server Error: Random API chaos simulated.');
      } else if (randomOutcome < 0.40) {
        throw new Error('SyntaxError: Unexpected token < in JSON at position 0 (Invalid JSON simulation)');
      }
    }

    // 4. Network Latency Simulation (150ms normal, 1800ms slow network)
    const delay = this.isSlowNetwork ? 1800 : 150;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // 5. Timeout Handling
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`API Timeout: Request to ${endpoint} exceeded ${timeoutMs}ms`)), timeoutMs)
    );

    try {
      const data = await Promise.race([Promise.resolve(fetcherFn()), timeoutPromise]);

      // Partial response simulation
      if (this.isChaosMode && Array.isArray(data) && !bypassChaos && Math.random() < 0.3) {
        const partialData = data.slice(0, Math.max(1, Math.floor(data.length / 2))) as unknown as T;
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
    } catch (error: any) {
      logger.stopTrace(`API_${endpoint}`);
      const errMessage = error instanceof Error ? error.message : 'Unknown API failure';
      logger.log('error', `[API Failure] ${endpoint}: ${errMessage}`);
      throw error;
    }
  }

  /**
   * Helper GET Method
   */
  public async get<T = any>(
    endpoint: string,
    fetcherFn: () => Promise<T> | T,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, fetcherFn, options);
  }

  /**
   * Helper POST Method
   */
  public async post<T = any>(
    endpoint: string,
    fetcherFn: () => Promise<T> | T,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, fetcherFn, options);
  }

  /**
   * Clear In-Memory API Cache
   */
  public clearCache() {
    this.cache.clear();
  }
}

export const apiClient = new ApiClient();
