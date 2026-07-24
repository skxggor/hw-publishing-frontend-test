import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Utils from '@core/utils.js';

describe('Utils - LocalStorage Functions', function () {
  beforeEach(function () {
    localStorage.clear();
  });

  describe('saveToLocalStorage', function () {
    it('should serialize and store value', function () {
      const result = Utils.saveToLocalStorage('key', { value: 42 });

      expect(result).toBe(true);
      expect(localStorage.getItem('key')).toBe('{"value":42}');
    });

    it('should return false for non-string key', function () {
      expect(Utils.saveToLocalStorage(123, 'value')).toBe(false);
      expect(Utils.saveToLocalStorage(null, 'value')).toBe(false);
    });

    it('should return false when storage throws', function () {
      vi.spyOn(window.localStorage, 'setItem').mockImplementation(function () {
        throw new Error('Quota exceeded');
      });

      const result = Utils.saveToLocalStorage('key', 'value');

      expect(result).toBe(false);

      vi.restoreAllMocks();
    });
  });

  describe('getFromLocalStorage', function () {
    it('should return parsed value when present', function () {
      localStorage.setItem('key', '{"value":42}');

      expect(Utils.getFromLocalStorage('key')).toEqual({ value: 42 });
    });

    it('should return null when key is missing', function () {
      expect(Utils.getFromLocalStorage('missing')).toBe(null);
    });

    it('should return null for non-string key', function () {
      expect(Utils.getFromLocalStorage(123)).toBe(null);
    });

    it('should return null when parsing throws', function () {
      localStorage.setItem('broken', '{invalid}');

      expect(Utils.getFromLocalStorage('broken')).toBe(null);
    });
  });

  describe('removeFromLocalStorage', function () {
    it('should remove key and return true', function () {
      localStorage.setItem('key', 'value');

      const result = Utils.removeFromLocalStorage('key');

      expect(result).toBe(true);
      expect(localStorage.getItem('key')).toBe(null);
    });

    it('should return false for non-string key', function () {
      expect(Utils.removeFromLocalStorage(123)).toBe(false);
    });
  });
});

describe('Utils - URL Functions', function () {
  beforeEach(function () {
    window.history.replaceState({}, '', '/test?a=1&b=two');
  });

  describe('getQueryParam', function () {
    it('should return value for existing param', function () {
      expect(Utils.getQueryParam('a')).toBe('1');
      expect(Utils.getQueryParam('b')).toBe('two');
    });

    it('should return null for missing param', function () {
      expect(Utils.getQueryParam('missing')).toBe(null);
    });

    it('should return null for non-string name', function () {
      expect(Utils.getQueryParam(123)).toBe(null);
    });
  });

  describe('setQueryParam', function () {
    it('should set param in URL', function () {
      Utils.setQueryParam('c', '3');

      expect(window.location.search).toContain('c=3');
    });

    it('should not modify URL for invalid arguments', function () {
      const before = window.location.search;

      Utils.setQueryParam(123, 'value');
      Utils.setQueryParam('x', undefined);

      expect(window.location.search).toBe(before);
    });
  });

  describe('removeQueryParam', function () {
    it('should remove param from URL', function () {
      Utils.removeQueryParam('a');

      expect(window.location.search).not.toContain('a=');
    });

    it('should not modify URL for invalid name', function () {
      const before = window.location.search;

      Utils.removeQueryParam(123);

      expect(window.location.search).toBe(before);
    });
  });
});

describe('Utils - getDeviceType', function () {
  afterEach(function () {
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true, writable: true });
  });

  it('should return mobile for width < 768', function () {
    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true, writable: true });

    expect(Utils.getDeviceType()).toBe('mobile');
  });

  it('should return tablet for width between 768 and 1023', function () {
    Object.defineProperty(window, 'innerWidth', { value: 900, configurable: true, writable: true });

    expect(Utils.getDeviceType()).toBe('tablet');
  });

  it('should return desktop for width >= 1024', function () {
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true, writable: true });

    expect(Utils.getDeviceType()).toBe('desktop');
  });
});

describe('Utils - isInViewport', function () {
  it('should return false for null element', function () {
    expect(Utils.isInViewport(null)).toBe(false);
  });

  it('should return true when element is within viewport', function () {
    const element = document.createElement('div');

    element.getBoundingClientRect = function () {
      return { top: 100, bottom: 200, left: 100, right: 200 };
    };

    expect(Utils.isInViewport(element)).toBe(true);
  });

  it('should return false when element is above viewport', function () {
    const element = document.createElement('div');

    element.getBoundingClientRect = function () {
      return { top: -300, bottom: -200, left: 0, right: 100 };
    };

    expect(Utils.isInViewport(element)).toBe(false);
  });
});

describe('Utils - smoothScroll', function () {
  it('should not throw when target is null', function () {
    expect(function safeScroll() {
      Utils.smoothScroll(null);
    }).not.toThrow();
  });

  it('should not throw when selector finds nothing', function () {
    expect(function safeScroll() {
      Utils.smoothScroll('#nonexistent');
    }).not.toThrow();
  });

  it('should call window.scrollTo for a valid element', function () {
    const element = document.createElement('div');
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(function () {});

    document.body.appendChild(element);
    element.getBoundingClientRect = function () {
      return { top: 200, bottom: 300, left: 0, right: 0 };
    };

    Utils.smoothScroll(element);

    expect(scrollToSpy).toHaveBeenCalledTimes(1);

    scrollToSpy.mockRestore();
    element.remove();
  });

  it('should scroll to an element found by selector', function () {
    const element = document.createElement('div');

    element.id = 'target';
    document.body.appendChild(element);
    element.getBoundingClientRect = function () {
      return { top: 100, bottom: 200, left: 0, right: 0 };
    };

    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(function () {});

    Utils.smoothScroll('#target');

    expect(scrollToSpy).toHaveBeenCalledTimes(1);

    scrollToSpy.mockRestore();
    element.remove();
  });
});
