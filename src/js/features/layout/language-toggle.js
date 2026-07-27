import Utils from '@core/utils.js';
import I18n from '@core/i18n.js';
import { pubSub } from '@core/pubsub.js';

const LOCALE_LABELS = {
  'pt-BR': 'PT',
  'en-US': 'EN',
};

const initLanguageToggle = function initLanguageToggle() {
  const languageToggle = Utils.getElement('#languageToggle');
  const currentLanguageSpan = Utils.getElement('#currentLanguage');

  if (!languageToggle || !currentLanguageSpan) {
    return;
  }

  const syncLabel = function syncLabel(locale) {
    currentLanguageSpan.textContent = LOCALE_LABELS[locale] || 'PT';
  };

  syncLabel(I18n.getCurrentLocale());

  const handleToggle = function handleToggle() {
    const currentLocale = I18n.getCurrentLocale();
    const nextLocale = currentLocale === 'pt-BR' ? 'en-US' : 'pt-BR';

    const switched = I18n.setLocale(nextLocale);

    if (!switched) {
      return;
    }

    syncLabel(nextLocale);
    I18n.translatePage();
    Utils.updateCopyrightYear();
    pubSub.publish('language:changed', nextLocale);
  };

  languageToggle.addEventListener('click', handleToggle);
};

export { initLanguageToggle };
