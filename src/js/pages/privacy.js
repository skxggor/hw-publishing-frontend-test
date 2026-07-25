import '@css/styles.css';
import '@core/view-transitions.js';

import { initPageTransition } from '@features/layout/transition.js';
import i18n from '@core/i18n.js';

const createPrivacyPage = function createPrivacyPage() {
  let isInitialized = false;

  const init = function init() {
    if (isInitialized) {
      return;
    }

    i18n.init();
    initPageTransition();

    isInitialized = true;
  };

  const destroy = function destroy() {
    if (!isInitialized) {
      return;
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
