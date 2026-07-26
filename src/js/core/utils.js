/**
 * Utility Functions - Pure functions for common operations
 */

const Utils = Object.freeze({
  isString: function isString(value) {
    return typeof value === 'string';
  },

  isNumber: function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  },

  isBoolean: function isBoolean(value) {
    return typeof value === 'boolean';
  },

  isArray: function isArray(value) {
    return Array.isArray(value);
  },

  isObject: function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  },

  isFunction: function isFunction(value) {
    return typeof value === 'function';
  },

  isEmpty: function isEmpty(value) {
    if (value === null || value === undefined) {
      return true;
    }

    if (Utils.isString(value) || Utils.isArray(value)) {
      return value.length === 0;
    }

    if (Utils.isObject(value)) {
      return Object.keys(value).length === 0;
    }

    return false;
  },

  getElement: function getElement(selector) {
    if (!Utils.isString(selector)) {
      return null;
    }

    return document.querySelector(selector);
  },

  getElements: function getElements(selector) {
    if (!Utils.isString(selector)) {
      return [];
    }

    return Array.from(document.querySelectorAll(selector));
  },

  addClass: function addClass(element, className) {
    if (!element || !className) {
      return;
    }

    element.classList.add(className);
  },

  removeClass: function removeClass(element, className) {
    if (!element || !className) {
      return;
    }

    element.classList.remove(className);
  },

  toggleClass: function toggleClass(element, className) {
    if (!element || !className) {
      return;
    }

    element.classList.toggle(className);
  },

  hasClass: function hasClass(element, className) {
    if (!element || !className) {
      return false;
    }

    return element.classList.contains(className);
  },

  saveToLocalStorage: function saveToLocalStorage(key, value) {
    if (!Utils.isString(key)) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);

      localStorage.setItem(key, serialized);

      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);

      return false;
    }
  },

  getFromLocalStorage: function getFromLocalStorage(key) {
    if (!Utils.isString(key)) {
      return null;
    }

    try {
      const item = localStorage.getItem(key);

      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);

      return null;
    }
  },

  removeFromLocalStorage: function removeFromLocalStorage(key) {
    if (!Utils.isString(key)) {
      return false;
    }

    localStorage.removeItem(key);

    return true;
  },

  getQueryParam: function getQueryParam(name) {
    if (!Utils.isString(name)) {
      return null;
    }

    const urlParameters = new URLSearchParams(window.location.search);

    return urlParameters.get(name);
  },

  setQueryParam: function setQueryParam(name, value) {
    if (!Utils.isString(name) || value === undefined) {
      return;
    }

    const url = new URL(window.location.href);

    url.searchParams.set(name, value);
    window.history.replaceState({}, '', url.toString());
  },

  removeQueryParam: function removeQueryParam(name) {
    if (!Utils.isString(name)) {
      return;
    }

    const url = new URL(window.location.href);

    url.searchParams.delete(name);
    window.history.replaceState({}, '', url.toString());
  },

  formatCurrency: function formatCurrency(value, locale = 'pt-BR', currency = 'BRL') {
    if (!Utils.isNumber(value)) {
      return '';
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(value);
  },

  formatDate: function formatDate(date, locale = 'pt-BR', options = undefined) {
    if (!date) {
      return '';
    }

    const dateObject = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObject.getTime())) {
      return '';
    }

    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    return new Intl.DateTimeFormat(locale, options || defaultOptions).format(dateObject);
  },

  debounce: function debounce(func, wait = 300) {
    if (!Utils.isFunction(func)) {
      return function noop() {};
    }

    let timeout;

    return function debouncedFunction(...arguments_) {
      const context = this;

      clearTimeout(timeout);

      timeout = setTimeout(function executeDebounced() {
        func.apply(context, arguments_);
      }, wait);
    };
  },

  throttle: function throttle(func, limit = 300) {
    if (!Utils.isFunction(func)) {
      return function noop() {};
    }

    let inThrottle = false;

    return function throttledFunction(...arguments_) {
      const context = this;

      if (inThrottle) {
        return;
      }

      func.apply(context, arguments_);

      inThrottle = true;

      setTimeout(function resetThrottle() {
        inThrottle = false;
      }, limit);
    };
  },

  deepClone: function deepClone(value) {
    if (value === null || typeof value !== 'object') {
      return value;
    }

    if (value instanceof Date) {
      return new Date(value.getTime());
    }

    if (value instanceof Array) {
      return value.map(function cloneItem(item) {
        return Utils.deepClone(item);
      });
    }

    const clonedObject = Object.create(Object.getPrototypeOf(value));

    Object.keys(value).forEach(function cloneKey(key) {
      clonedObject[key] = Utils.deepClone(value[key]);
    });

    return clonedObject;
  },

  generateId: function generateId(prefix = 'id') {
    const timestamp = Date.now();

    const random = Math.random().toString(36).substring(2, 11);

    return `${prefix}-${timestamp}-${random}`;
  },

  getDeviceType: function getDeviceType() {
    const width = window.innerWidth;

    if (width < 768) {
      return 'mobile';
    }

    if (width < 1024) {
      return 'tablet';
    }

    return 'desktop';
  },

  isInViewport: function isInViewport(element) {
    if (!element) {
      return false;
    }

    const rectangle = element.getBoundingClientRect();

    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    return (
      rectangle.top <= windowHeight &&
      rectangle.bottom >= 0 &&
      rectangle.left <= windowWidth &&
      rectangle.right >= 0
    );
  },

  smoothScroll: function smoothScroll(target, offset = 0) {
    if (!target) {
      return;
    }

    const targetElement = Utils.isString(target) ? Utils.getElement(target) : target;

    if (!targetElement) {
      return;
    }

    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    });
  },

  updateCopyrightYear: function updateCopyrightYear() {
    const year = new Date().getFullYear();
    const elements = Utils.getElements('.footer__copyright');

    elements.forEach(function replaceYear(element) {
      element.textContent = element.textContent.replace(/\d{4}/, String(year));
    });
  },

  hideLoader: function hideLoader(delay = 500) {
    const loader = Utils.getElement('#pageLoader');

    if (!loader) return;

    setTimeout(function fadeOutLoader() {
      loader.setAttribute('aria-hidden', 'true');

      loader.addEventListener(
        'transitionend',
        function removeLoader() {
          loader.remove();
        },
        { once: true }
      );
    }, delay);
  },
});

export default Utils;
