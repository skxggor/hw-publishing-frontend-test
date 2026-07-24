import { beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

beforeEach(function globalBeforeEach() {
  document.body.innerHTML = '';

  vi.clearAllMocks();
});

const createLocalStorageMock = function createLocalStorageMock() {
  let store = Object.create(null);

  return {
    getItem: function getItem(key) {
      return store[key] || null;
    },
    setItem: function setItem(key, value) {
      store[key] = String(value);
    },
    removeItem: function removeItem(key) {
      delete store[key];
    },
    clear: function clear() {
      store = Object.create(null);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: function key(index) {
      const keys = Object.keys(store);

      return keys[index] || null;
    },
  };
};

const localStorageMock = createLocalStorageMock();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(function createMediaQueryList(query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  }),
});

global.IntersectionObserver = vi.fn().mockImplementation(function createIntersectionObserver() {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
});

global.requestAnimationFrame = function mockRequestAnimationFrame(callback) {
  return setTimeout(callback, 16);
};

global.cancelAnimationFrame = function mockCancelAnimationFrame(identifier) {
  clearTimeout(identifier);
};
