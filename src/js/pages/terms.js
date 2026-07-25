import '@css/styles.css';
import '@core/view-transitions.js';

import { initPageTransition } from '@features/layout/transition.js';
import i18n from '@core/i18n.js';

const createTermsPage = function createTermsPage() {
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

const termsPage = createTermsPage();

document.addEventListener('DOMContentLoaded', function startTerms() {
  termsPage.init();
});

export { createTermsPage };
export default termsPage;
