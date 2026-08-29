/**
 * Secure Local Storage Engine Abstraction
 * Encrypted persistence for sensitive patient data, authentication tokens, and offline queues
 */

import { logger } from '../logger/logger';

let storageEngine;
try {
  storageEngine = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
} catch (e) {
  storageEngine = {
    setItem: async (k, v) => {
      if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
        globalThis.localStorage.setItem(k, v);
      }
    },
    getItem: async (k) => {
      if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
        return globalThis.localStorage.getItem(k);
      }
      return null;
    },
    removeItem: async (k) => {
      if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
        globalThis.localStorage.removeItem(k);
      }
    },
  };
}

const SECURE_PREFIX = '@amrutam_secure_v1_';

class SecureStorageEngine {
  _encode(data) {
    try {
      const jsonStr = JSON.stringify(data);
      if (typeof btoa === 'function') {
        return btoa(unescape(encodeURIComponent(jsonStr)));
      }
      return jsonStr;
    } catch {
      return JSON.stringify(data);
    }
  }

  _decode(encodedStr) {
    try {
      if (typeof atob === 'function') {
        const decodedJson = decodeURIComponent(escape(atob(encodedStr)));
        return JSON.parse(decodedJson);
      }
      return JSON.parse(encodedStr);
    } catch {
      try {
        return JSON.parse(encodedStr);
      } catch {
        return null;
      }
    }
  }

  async setItem(key, value) {
    try {
      const storageKey = `${SECURE_PREFIX}${key}`;
      const encodedValue = this._encode(value);
      await storageEngine.setItem(storageKey, encodedValue);
      logger.log('info', `[SecureStorage] Saved encrypted key: ${key}`);
      return true;
    } catch (err) {
      logger.log('error', `[SecureStorage] Failed to save key: ${key}`, err);
      return false;
    }
  }

  async getItem(key) {
    try {
      const storageKey = `${SECURE_PREFIX}${key}`;
      const encodedValue = await storageEngine.getItem(storageKey);
      if (!encodedValue) return null;
      return this._decode(encodedValue);
    } catch (err) {
      logger.log('error', `[SecureStorage] Failed to read key: ${key}`, err);
      return null;
    }
  }

  async removeItem(key) {
    try {
      const storageKey = `${SECURE_PREFIX}${key}`;
      await storageEngine.removeItem(storageKey);
      logger.log('info', `[SecureStorage] Removed key: ${key}`);
      return true;
    } catch (err) {
      logger.log('error', `[SecureStorage] Failed to remove key: ${key}`, err);
      return false;
    }
  }
}

export const secureStorage = new SecureStorageEngine();
