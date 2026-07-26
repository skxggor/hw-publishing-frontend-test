import '@css/styles.css';
import '@core/view-transitions.js';

import { pubSub } from '@core/pubsub.js';
import Utils from '@core/utils.js';
import I18n from '@core/i18n.js';
import { mountGlassEdges } from '@features/layout/glass-edges.js';
import { initPageTransition } from '@features/layout/transition.js';

const createPrivacyPage = function createPrivacyPage() {
  let isInitialized = false;
  let glassEdgesCleanup = null;

  const initLanguageToggle = function initLanguageToggle() {
    const languageToggle = Utils.getElement('#languageToggle');
    const currentLanguageSpan = Utils.getElement('#currentLanguage');

    if (!languageToggle || !currentLanguageSpan) {
      return;
    }

    const handleToggle = function handleToggle() {
      const currentLocale = I18n.getCurrentLocale();
      const nextLocale = currentLocale === 'pt-BR' ? 'en-US' : 'pt-BR';

      const switched = I18n.setLocale(nextLocale);

      if (!switched) {
        return;
      }

      currentLanguageSpan.textContent = nextLocale === 'pt-BR' ? 'PT' : 'EN';
      I18n.translatePage();
      pubSub.publish('language:changed', nextLocale);
    };

    languageToggle.addEventListener('click', handleToggle);
  };

  const init = function init() {
    if (isInitialized) {
      return;
    }

    I18n.init();
    initPageTransition();
    initLanguageToggle();
    glassEdgesCleanup = mountGlassEdges();
    Utils.updateCopyrightYear();

    isInitialized = true;
  };

  const destroy = function destroy() {
    if (!isInitialized) {
      return;
    }

    if (glassEdgesCleanup) {
      glassEdgesCleanup();
      glassEdgesCleanup = null;
    }

    isInitialized = false;
  };

  return Object.freeze({ init, destroy });
};

const privacyPage = createPrivacyPage();

document.addEventListener('DOMContentLoaded', function startPrivacy() {
  privacyPage.init();
});

export { createPrivacyPage };
export default privacyPage;
