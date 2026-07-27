import { describe, it, expect, beforeEach } from 'vitest';
import Utils from '@core/utils.js';

describe('Utils - Type Checking Functions', function () {
  describe('isString', function () {
    it('should return true for strings', function () {
      expect(Utils.isString('hello')).toBe(true);
      expect(Utils.isString('')).toBe(true);
    });

    it('should return false for non-strings', function () {
      expect(Utils.isString(123)).toBe(false);
      expect(Utils.isString(null)).toBe(false);
      expect(Utils.isString(undefined)).toBe(false);
      expect(Utils.isString({})).toBe(false);
      expect(Utils.isString([])).toBe(false);
    });
  });

  describe('isNumber', function () {
    it('should return true for valid numbers', function () {
      expect(Utils.isNumber(123)).toBe(true);
      expect(Utils.isNumber(0)).toBe(true);
      expect(Utils.isNumber(-1)).toBe(true);
      expect(Utils.isNumber(1.5)).toBe(true);
    });

    it('should return false for non-numbers', function () {
      expect(Utils.isNumber(NaN)).toBe(false);
      expect(Utils.isNumber('123')).toBe(false);
      expect(Utils.isNumber(null)).toBe(false);
      expect(Utils.isNumber(undefined)).toBe(false);
    });
  });

  describe('isBoolean', function () {
    it('should return true for booleans', function () {
      expect(Utils.isBoolean(true)).toBe(true);
      expect(Utils.isBoolean(false)).toBe(true);
    });

    it('should return false for non-booleans', function () {
      expect(Utils.isBoolean('true')).toBe(false);
      expect(Utils.isBoolean(1)).toBe(false);
      expect(Utils.isBoolean(0)).toBe(false);
    });
  });

  describe('isArray', function () {
    it('should return true for arrays', function () {
      expect(Utils.isArray([])).toBe(true);
      expect(Utils.isArray([1, 2, 3])).toBe(true);
    });

    it('should return false for non-arrays', function () {
      expect(Utils.isArray({})).toBe(false);
      expect(Utils.isArray('array')).toBe(false);
      expect(Utils.isArray(null)).toBe(false);
    });
  });

  describe('isObject', function () {
    it('should return true for plain objects', function () {
      expect(Utils.isObject({})).toBe(true);
      expect(Utils.isObject({ key: 'value' })).toBe(true);
    });

    it('should return false for non-objects', function () {
      expect(Utils.isObject([])).toBe(false);
      expect(Utils.isObject(null)).toBe(false);
      expect(Utils.isObject('string')).toBe(false);
    });
  });

  describe('isEmpty', function () {
    it('should return true for empty values', function () {
      expect(Utils.isEmpty(null)).toBe(true);
      expect(Utils.isEmpty(undefined)).toBe(true);
      expect(Utils.isEmpty('')).toBe(true);
      expect(Utils.isEmpty([])).toBe(true);
      expect(Utils.isEmpty({})).toBe(true);
    });

    it('should return false for non-empty values', function () {
      expect(Utils.isEmpty('text')).toBe(false);
      expect(Utils.isEmpty([1])).toBe(false);
      expect(Utils.isEmpty({ key: 'value' })).toBe(false);
      expect(Utils.isEmpty(0)).toBe(false);
      expect(Utils.isEmpty(false)).toBe(false);
    });
  });
});

describe('Utils - DOM Functions', function () {
  beforeEach(function () {
    document.body.innerHTML = '';
  });

  describe('getElement', function () {
    it('should return element when found', function () {
      document.body.innerHTML = '<div id="test">Content</div>';
      const element = Utils.getElement('#test');
      expect(element).not.toBe(null);
      expect(element.textContent).toBe('Content');
    });

    it('should return null when not found', function () {
      const element = Utils.getElement('#nonexistent');
      expect(element).toBe(null);
    });

    it('should return null for invalid selector', function () {
      expect(Utils.getElement(null)).toBe(null);
      expect(Utils.getElement(undefined)).toBe(null);
      expect(Utils.getElement(123)).toBe(null);
    });
  });

  describe('getElements', function () {
    it('should return array of elements when found', function () {
      document.body.innerHTML = '<div class="item">1</div><div class="item">2</div>';
      const elements = Utils.getElements('.item');
      expect(elements).toHaveLength(2);
    });

    it('should return empty array when not found', function () {
      const elements = Utils.getElements('.nonexistent');
      expect(elements).toEqual([]);
    });

    it('should return empty array for invalid selector', function () {
      expect(Utils.getElements(null)).toEqual([]);
      expect(Utils.getElements(123)).toEqual([]);
    });
  });

  describe('addClass', function () {
    it('should add class to element', function () {
      const element = document.createElement('div');
      Utils.addClass(element, 'test-class');
      expect(element.classList.contains('test-class')).toBe(true);
    });

    it('should not add class if element is null', function () {
      Utils.addClass(null, 'test-class');
      expect(true).toBe(true);
    });

    it('should not add class if className is empty', function () {
      const element = document.createElement('div');
      Utils.addClass(element, '');
      expect(element.className).toBe('');
    });
  });

  describe('removeClass', function () {
    it('should remove class from element', function () {
      const element = document.createElement('div');
      element.classList.add('test-class');
      Utils.removeClass(element, 'test-class');
      expect(element.classList.contains('test-class')).toBe(false);
    });

    it('should not error if element is null', function () {
      Utils.removeClass(null, 'test-class');
      expect(true).toBe(true);
    });
  });

  describe('hasClass', function () {
    it('should return true if element has class', function () {
      const element = document.createElement('div');
      element.classList.add('test-class');
      expect(Utils.hasClass(element, 'test-class')).toBe(true);
    });

    it('should return false if element does not have class', function () {
      const element = document.createElement('div');
      expect(Utils.hasClass(element, 'test-class')).toBe(false);
    });

    it('should return false if element is null', function () {
      expect(Utils.hasClass(null, 'test-class')).toBe(false);
    });
  });
});

describe('Utils - Format Functions', function () {
  describe('formatCurrency', function () {
    it('should format number as currency', function () {
      const result = Utils.formatCurrency(1234.56);
      expect(result).toContain('R$');
      expect(result).toContain('1.234,56');
    });

    it('should return empty string for non-number', function () {
      expect(Utils.formatCurrency('123')).toBe('');
      expect(Utils.formatCurrency(null)).toBe('');
      expect(Utils.formatCurrency(undefined)).toBe('');
    });

    it('should format with custom locale', function () {
      const result = Utils.formatCurrency(1234.56, 'en-US', 'USD');
      expect(result).toContain('$');
      expect(result).toContain('1,234.56');
    });
  });

  describe('formatDate', function () {
    it('should format date string', function () {
      const date = new Date('2024-01-15');
      const result = Utils.formatDate(date);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should return empty string for invalid date', function () {
      expect(Utils.formatDate('invalid')).toBe('');
      expect(Utils.formatDate(null)).toBe('');
      expect(Utils.formatDate(undefined)).toBe('');
    });
  });
});

describe('Utils - Utility Functions', function () {
  describe('debounce', function () {
    it('should debounce function calls', function () {
      const fn = vi.fn();
      const debouncedFn = Utils.debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(fn).not.toHaveBeenCalled();
    });

    it('should call function after delay', function (done) {
      const fn = vi.fn();
      const debouncedFn = Utils.debounce(fn, 50);

      debouncedFn();

      setTimeout(function () {
        expect(fn).toHaveBeenCalledTimes(1);
        done();
      }, 100);
    });

    it('should return noop for non-function', function () {
      const result = Utils.debounce('not a function', 100);
      expect(typeof result).toBe('function');
      result();
    });
  });

  describe('throttle', function () {
    it('should throttle function calls', function () {
      const fn = vi.fn();
      const throttledFn = Utils.throttle(fn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call function again after delay', function (done) {
      const fn = vi.fn();
      const throttledFn = Utils.throttle(fn, 50);

      throttledFn();

      setTimeout(function () {
        throttledFn();
        expect(fn).toHaveBeenCalledTimes(2);
        done();
      }, 100);
    });
  });

  describe('deepClone', function () {
    it('should clone object deeply', function () {
      const original = {
        nested: {
          value: 42,
          array: [1, 2, 3],
        },
      };

      const cloned = Utils.deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.nested).not.toBe(original.nested);
    });

    it('should clone arrays', function () {
      const original = [1, [2, 3], { key: 'value' }];
      const cloned = Utils.deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('should clone date objects', function () {
      const date = new Date('2024-01-15');
      const cloned = Utils.deepClone(date);

      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
    });

    it('should return primitive values as-is', function () {
      expect(Utils.deepClone(42)).toBe(42);
      expect(Utils.deepClone('string')).toBe('string');
      expect(Utils.deepClone(null)).toBe(null);
    });
  });

  describe('generateId', function () {
    it('should generate unique IDs', function () {
      const id1 = Utils.generateId();
      const id2 = Utils.generateId();

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
    });

    it('should use custom prefix', function () {
      const id = Utils.generateId('custom');

      expect(id.startsWith('custom-')).toBe(true);
    });
  });
});
