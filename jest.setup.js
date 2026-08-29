/**
 * Jest Setup Polyfills for Node 25 and React Native Jest Preset
 */

const mockLocalStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null,
};

try {
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    configurable: true,
    writable: true,
  });
} catch (e) {
  // Ignore if already defined
}

if (!globalThis.performance) {
  // @ts-ignore
  globalThis.performance = {
    now: () => Date.now(),
  };
}
