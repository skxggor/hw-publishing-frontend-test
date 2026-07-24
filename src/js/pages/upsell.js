import '@css/styles.css';
import '@core/view-transitions.js';

import { pubSub } from '@core/pubsub.js';
import Utils from '@core/utils.js';
import I18n from '@core/i18n.js';

const CONTENT_REVEAL_DELAY = 15000;

const createUpsellPage = function createUpsellPage() {
  let isInitialized = false;
  let revealTimeout = null;
  let scrollProgressElement = null;

  const revealHiddenContent = function revealHiddenContent() {
    const content = Utils.getElement('#upsellContent');

    if (!content) {
      return;
    }

    Utils.removeClass(content, 'is-hidden');

    if (window.gsap) {
      window.gsap.fromTo(
        content,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );
    }

    pubSub.publish('upsell:content-revealed', { method: 'timeout' });
  };

  const initVideoTracking = function initVideoTracking() {
    const iframe = Utils.getElement('#upsellVideo');

    if (!iframe) {
      revealTimeout = setTimeout(revealHiddenContent, CONTENT_REVEAL_DELAY);

      return;
    }

    revealTimeout = setTimeout(revealHiddenContent, CONTENT_REVEAL_DELAY);

    pubSub.publish('upsell:video-tracking-initialized', { delay: CONTENT_REVEAL_DELAY });
  };

  const initCtaTracking = function initCtaTracking() {
    const acceptButton = Utils.getElement('a[href*="companion=true"]');
    const declineButton = Utils.getElement('a[href*="companion=false"]');

    if (!acceptButton || !declineButton) {
      return;
    }

    acceptButton.addEventListener('click', function trackAccept() {
      pubSub.publish('upsell:cta:accept', { timestamp: Date.now() });
    });

    declineButton.addEventListener('click', function trackDecline() {
      pubSub.publish('upsell:cta:decline', { timestamp: Date.now() });
    });
  };

  const createScrollProgress = function createScrollProgress() {
    scrollProgressElement = document.createElement('div');

    Utils.addClass(scrollProgressElement, 'scroll-progress');
    document.body.appendChild(scrollProgressElement);

    const updateProgress = Utils.throttle(function updateProgress() {
      const scrollTop = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;

      scrollProgressElement.style.setProperty('--scroll-progress', `${Math.min(progress, 100)}%`);
    }, 50);

    window.addEventListener('scroll', updateProgress, { passive: true });

    updateProgress();
  };

  const initEntranceAnimations = function initEntranceAnimations() {
    if (!window.gsap) {
      return;
    }

    window.gsap.fromTo(
      '.upsell-hero__container > *',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power2.out' }
    );

    window.gsap.fromTo(
      '.video-section__wrapper',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1, delay: 0.5, ease: 'power2.out' }
    );
  };

  const cleanup = function cleanup() {
    if (revealTimeout) {
      clearTimeout(revealTimeout);
      revealTimeout = null;
    }

    if (scrollProgressElement && scrollProgressElement.parentNode) {
      scrollProgressElement.parentNode.removeChild(scrollProgressElement);
      scrollProgressElement = null;
    }
  };

  const init = function init() {
    if (isInitialized) {
      return;
    }

    I18n.init();
    initVideoTracking();
    initCtaTracking();
    createScrollProgress();
    initEntranceAnimations();

    pubSub.publish('upsell:initialized', { locale: I18n.getCurrentLocale() });

    isInitialized = true;
  };

  const destroy = function destroy() {
    if (!isInitialized) {
      return;
    }

    cleanup();
    pubSub.clear('upsell:initialized');
    isInitialized = false;
  };

  return Object.freeze({ init, destroy });
};

const upsellPage = createUpsellPage();

document.addEventListener('DOMContentLoaded', function startUpsell() {
  upsellPage.init();
});

export { createUpsellPage };
export default upsellPage;
