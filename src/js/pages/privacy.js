import '@css/styles.css';
import '@core/view-transitions.js';

import Utils from '@core/utils.js';
import I18n from '@core/i18n.js';
import { mountGlassEdges } from '@features/layout/glass-edges.js';
import { initLanguageToggle } from '@features/layout/language-toggle.js';

const createPrivacyPage = function createPrivacyPage() {
  let isInitialized = false;
  let glassEdgesCleanup = null;

  const init = function init() {
    if (isInitialized) {
      return;
    }

    I18n.init();
    initLanguageToggle();
    glassEdgesCleanup = mountGlassEdges();
    Utils.updateCopyrightYear();
    Utils.hideLoader();

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
