import ptBR from '@locales/pt-BR.json';
import enUS from '@locales/en-US.json';

const supportedLocales = ['pt-BR', 'en-US'];

const translationsByLocale = {
  'pt-BR': ptBR,
  'en-US': enUS,
};

const createI18n = function createI18n() {
  let currentLocale = 'pt-BR';

  const isSupportedLocale = function isSupportedLocale(locale) {
    if (!locale) {
      return false;
    }

    return supportedLocales.includes(locale);
  };

  const detectLocale = function detectLocale() {
    const stored = localStorage.getItem('preferred-locale');

    if (isSupportedLocale(stored)) {
      return stored;
    }

    const browserLanguage = navigator.language || navigator.userLanguage;

    if (browserLanguage && browserLanguage.startsWith('en')) {
      return 'en-US';
    }

    return 'pt-BR';
  };

  const getTranslation = function getTranslation(key, defaultValue = '') {
    if (!key) {
      return defaultValue;
    }

    const activeTranslations = translationsByLocale[currentLocale];
    const keySegments = key.split('.');
    let value = activeTranslations;

    for (let index = 0; index < keySegments.length; index++) {
      if (!value || typeof value !== 'object') {
        return defaultValue;
      }

      value = value[keySegments[index]];
    }

    if (value === undefined || value === null) {
      return defaultValue;
    }

    return value;
  };

  const setLocale = function setLocale(locale) {
    if (!isSupportedLocale(locale)) {
      return false;
    }

    currentLocale = locale;
    localStorage.setItem('preferred-locale', locale);

    return true;
  };

  const getCurrentLocale = function getCurrentLocale() {
    return currentLocale;
  };

  const getSupportedLocales = function getSupportedLocales() {
    return [...supportedLocales];
  };

  const translateElement = function translateElement(element) {
    if (!element) {
      return;
    }

    const translationKey = element.getAttribute('data-i18n');
    const translation = getTranslation(translationKey);

    if (!translation) {
      return;
    }

    const isFormField = element.tagName === 'INPUT' || element.tagName === 'TEXTAREA';

    if (isFormField) {
      element.placeholder = translation;

      return;
    }

    element.textContent = translation;
  };

  const translatePage = function translatePage() {
    const translatableElements = document.querySelectorAll('[data-i18n]');

    translatableElements.forEach(translateElement);
  };

  const init = function init() {
    const locale = detectLocale();

    setLocale(locale);
    translatePage();

    return true;
  };

  return Object.freeze({
    init,
    get: getTranslation,
    setLocale,
    getCurrentLocale,
    getSupportedLocales,
    translatePage,
  });
};

const I18n = createI18n();

export { createI18n };
export default I18n;
