import { describe, it, expect, beforeEach } from 'vitest';
import { createI18n } from '@core/i18n.js';

describe('I18n - Internationalization Module', function () {
  let i18n;

  beforeEach(function () {
    localStorage.clear();
    Object.defineProperty(navigator, 'language', {
      value: 'pt-BR',
      configurable: true,
    });
    i18n = createI18n();
  });

  describe('detectLocale (via init)', function () {
    it('should use stored locale when valid', function () {
      localStorage.setItem('preferred-locale', 'en-US');

      i18n.init();

      expect(i18n.getCurrentLocale()).toBe('en-US');
    });

    it('should ignore invalid stored locale', function () {
      localStorage.setItem('preferred-locale', 'es-ES');

      i18n.init();

      expect(i18n.getCurrentLocale()).toBe('pt-BR');
    });

    it('should detect browser language when no stored preference', function () {
      Object.defineProperty(navigator, 'language', {
        value: 'en-US',
        configurable: true,
      });

      i18n.init();

      expect(i18n.getCurrentLocale()).toBe('en-US');
    });

    it('should fall back to pt-BR for unsupported browser language', function () {
      Object.defineProperty(navigator, 'language', {
        value: 'fr-FR',
        configurable: true,
      });

      i18n.init();

      expect(i18n.getCurrentLocale()).toBe('pt-BR');
    });

    it('should fall back to pt-BR when navigator.language is empty', function () {
      Object.defineProperty(navigator, 'language', {
        value: '',
        configurable: true,
      });

      i18n.init();

      expect(i18n.getCurrentLocale()).toBe('pt-BR');
    });
  });

  describe('get', function () {
    beforeEach(function () {
      i18n.init();
    });

    it('should return translation for valid nested key', function () {
      const translation = i18n.get('header.logo');

      expect(translation).toBe('H&W Publishing');
    });

    it('should return translation for deep nested key', function () {
      const translation = i18n.get('landing.hero.title');

      expect(typeof translation).toBe('string');
      expect(translation.length).toBeGreaterThan(0);
    });

    it('should return default value for missing key', function () {
      expect(i18n.get('nonexistent.key', 'fallback')).toBe('fallback');
    });

    it('should return empty string as default when no default provided', function () {
      expect(i18n.get('nonexistent.key')).toBe('');
    });

    it('should return default value for empty key', function () {
      expect(i18n.get('', 'fallback')).toBe('fallback');
    });

    it('should return default value for null key', function () {
      expect(i18n.get(null, 'fallback')).toBe('fallback');
    });

    it('should return default when traversing into non-object', function () {
      expect(i18n.get('header.logo.invalid', 'fallback')).toBe('fallback');
    });
  });

  describe('setLocale', function () {
    it('should switch to supported locale', function () {
      const result = i18n.setLocale('en-US');

      expect(result).toBe(true);
      expect(i18n.getCurrentLocale()).toBe('en-US');
    });

    it('should persist locale to localStorage', function () {
      i18n.setLocale('en-US');

      expect(localStorage.getItem('preferred-locale')).toBe('en-US');
    });

    it('should return false for unsupported locale', function () {
      const result = i18n.setLocale('es-ES');

      expect(result).toBe(false);
      expect(i18n.getCurrentLocale()).toBe('pt-BR');
    });

    it('should return false for null locale', function () {
      expect(i18n.setLocale(null)).toBe(false);
    });

    it('should reflect new translations after switching', function () {
      i18n.setLocale('en-US');

      expect(i18n.get('header.logo')).toBe('H&W Publishing');
      expect(i18n.get('header.home')).toBe('Home');
    });
  });

  describe('getCurrentLocale', function () {
    it('should default to pt-BR before init', function () {
      expect(i18n.getCurrentLocale()).toBe('pt-BR');
    });
  });

  describe('getSupportedLocales', function () {
    it('should return array with supported locales', function () {
      const locales = i18n.getSupportedLocales();

      expect(Array.isArray(locales)).toBe(true);
      expect(locales).toContain('pt-BR');
      expect(locales).toContain('en-US');
    });

    it('should return a copy (immutable)', function () {
      const first = i18n.getSupportedLocales();
      const second = i18n.getSupportedLocales();

      expect(first).not.toBe(second);
      expect(first).toEqual(second);
    });
  });

  describe('translatePage', function () {
    beforeEach(function () {
      i18n.init();
    });

    it('should translate elements with data-i18n attribute', function () {
      document.body.innerHTML =
        '<div data-i18n="header.logo"></div><span data-i18n="header.home"></span>';

      i18n.translatePage();

      expect(document.querySelector('[data-i18n="header.logo"]').textContent).toBe(
        'H&W Publishing'
      );
      expect(document.querySelector('[data-i18n="header.home"]').textContent).toBe('Início');
    });

    it('should set placeholder for input fields', function () {
      document.body.innerHTML = '<input type="text" data-i18n="common.loading" />';

      i18n.translatePage();

      expect(document.querySelector('input').placeholder).toBe('Carregando...');
    });

    it('should set placeholder for textarea fields', function () {
      document.body.innerHTML = '<textarea data-i18n="common.loading"></textarea>';

      i18n.translatePage();

      expect(document.querySelector('textarea').placeholder).toBe('Carregando...');
    });

    it('should not modify elements without data-i18n', function () {
      document.body.innerHTML = '<div>Original text</div>';

      i18n.translatePage();

      expect(document.querySelector('div').textContent).toBe('Original text');
    });

    it('should leave element untouched when translation key is missing', function () {
      document.body.innerHTML = '<div data-i18n="nonexistent.key">Keep this</div>';

      i18n.translatePage();

      expect(document.querySelector('div').textContent).toBe('Keep this');
    });
  });

  describe('init', function () {
    it('should detect locale, set it, and translate the page', function () {
      document.body.innerHTML = '<div data-i18n="header.logo"></div>';

      const result = i18n.init();

      expect(result).toBe(true);
      expect(i18n.getCurrentLocale()).toBe('pt-BR');
      expect(document.querySelector('div').textContent).toBe('H&W Publishing');
    });

    it('should keep page translated after locale switch when re-translating', function () {
      document.body.innerHTML = '<div data-i18n="header.home"></div>';

      i18n.init();

      expect(document.querySelector('div').textContent).toBe('Início');

      i18n.setLocale('en-US');
      i18n.translatePage();

      expect(document.querySelector('div').textContent).toBe('Home');
    });
  });

  describe('frozen API', function () {
    it('should expose the expected methods', function () {
      const methods = [
        'init',
        'get',
        'setLocale',
        'getCurrentLocale',
        'getSupportedLocales',
        'translatePage',
      ];

      methods.forEach(function (method) {
        expect(typeof i18n[method]).toBe('function');
      });
    });

    it('should be frozen (immutable)', function () {
      expect(Object.isFrozen(i18n)).toBe(true);
    });
  });
});
