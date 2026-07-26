import '@css/styles.css';
import '@core/view-transitions.js';

import { pubSub } from '@core/pubsub.js';
import Utils from '@core/utils.js';
import I18n from '@core/i18n.js';
import { mountGlassEdges } from '@features/layout/glass-edges.js';
import { initLanguageToggle } from '@features/layout/language-toggle.js';
import { gsap } from 'gsap';

const EASE_SMOOTH = 'sine.inOut';
const EASE_OUT = 'power2.out';
const IMAGE_CROSSFADE_DURATION = 1.2;
const IMAGE_CROSSFADE_HOLD = 5;
const VIDEO_REVEAL_TIME = 10000;
const SCROLL_PROGRESS_THROTTLE = 50;

const createUpsellPage = function createUpsellPage() {
  let isInitialized = false;
  let glassEdgesCleanup = null;
  let revealTimeout = null;
  let scrollProgressElement = null;
  let crossfadeTimeline = null;

  const prefersReducedMotion = function prefersReducedMotion() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  const initImageCrossfade = function initImageCrossfade() {
    const primary = Utils.getElement('.upsell-hero__image--primary');
    const alternate = Utils.getElement('.upsell-hero__image--alternate');

    if (!primary || !alternate || prefersReducedMotion()) {
      return;
    }

    gsap.set(primary, { opacity: 1 });
    gsap.set(alternate, { opacity: 0 });

    crossfadeTimeline = gsap.timeline({ repeat: -1 });

    crossfadeTimeline
      .to(
        alternate,
        {
          duration: IMAGE_CROSSFADE_DURATION,
          ease: EASE_OUT,
          opacity: 1,
          onStart: function showAlternate() {
            alternate.style.display = 'block';
          },
        },
        IMAGE_CROSSFADE_HOLD
      )
      .to(
        primary,
        { duration: IMAGE_CROSSFADE_DURATION, ease: EASE_OUT, opacity: 0 },
        IMAGE_CROSSFADE_HOLD
      )
      .to(
        alternate,
        {
          duration: IMAGE_CROSSFADE_DURATION,
          ease: EASE_OUT,
          opacity: 0,
          onComplete: function hideAlternate() {
            alternate.style.display = 'none';
          },
        },
        `+=${IMAGE_CROSSFADE_HOLD}`
      )
      .to(primary, { duration: IMAGE_CROSSFADE_DURATION, ease: EASE_OUT, opacity: 1 }, '<');
  };

  const revealHeroContent = function revealHeroContent() {
    const content = Utils.getElement('#upsellContent');
    const header = Utils.getElement('#upsellHeader');

    if (!content) {
      return;
    }

    Utils.removeClass(content, 'is-hidden');

    if (header) {
      Utils.removeClass(header, 'is-hidden');
    }

    if (prefersReducedMotion()) {
      return;
    }

    const elements = Utils.getElements('#upsellContent > *');

    gsap.fromTo(
      elements,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: EASE_OUT }
    );

    if (header) {
      gsap.fromTo(
        header,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: EASE_OUT }
      );
    }

    initImageCrossfade();
  };

  const initVideoTracking = function initVideoTracking() {
    const countdownElement = Utils.getElement('#upsellCountdown');
    const countdownNumber = Utils.getElement('#countdownNumber');
    let remaining = 10;

    document.body.style.overflow = 'hidden';

    if (countdownNumber) {
      countdownNumber.textContent = remaining;
    }

    const countdownInterval = setInterval(function updateCountdown() {
      remaining -= 1;

      if (countdownNumber) {
        countdownNumber.textContent = remaining;
      }

      if (remaining <= 0) {
        clearInterval(countdownInterval);
        document.body.style.overflow = '';

        if (countdownElement) {
          Utils.addClass(countdownElement, 'is-hidden');
        }

        revealHeroContent();
        pubSub.publish('upsell:images-revealed', { method: 'timeout' });
      }
    }, 1000);

    revealTimeout = countdownInterval;
    pubSub.publish('upsell:video-tracking-initialized', { delay: VIDEO_REVEAL_TIME });
  };

  const initPriceBadge = function initPriceBadge() {
    if (prefersReducedMotion()) {
      return;
    }

    const priceBadge = Utils.getElement('.price-badge--upsell');
    const bookImages = Utils.getElement('.upsell-hero__images');

    if (priceBadge) {
      gsap.to(priceBadge, {
        duration: 3,
        ease: EASE_SMOOTH,
        repeat: -1,
        y: -6,
        yoyo: true,
      });
    }

    if (bookImages) {
      gsap.to(bookImages, {
        duration: 3,
        ease: EASE_SMOOTH,
        repeat: -1,
        y: -8,
        yoyo: true,
      });
    }
  };

  const initCtaTracking = function initCtaTracking() {
    const acceptButtons = Utils.getElements('a[href*="companion=true"]');
    const declineButton = Utils.getElement('a[href*="companion=false"]');

    acceptButtons.forEach(function trackAcceptButton(button) {
      button.addEventListener('click', function trackAccept() {
        pubSub.publish('upsell:cta:accept', { timestamp: Date.now() });
      });
    });

    if (!declineButton) {
      return;
    }

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
    }, SCROLL_PROGRESS_THROTTLE);

    window.addEventListener('scroll', updateProgress, { passive: true });

    updateProgress();
  };

  const cleanup = function cleanup() {
    if (revealTimeout) {
      clearInterval(revealTimeout);
      revealTimeout = null;
    }

    document.body.style.overflow = '';

    if (crossfadeTimeline) {
      crossfadeTimeline.kill();
      crossfadeTimeline = null;
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
    initLanguageToggle();
    initVideoTracking();
    initPriceBadge();
    initCtaTracking();
    createScrollProgress();
    glassEdgesCleanup = mountGlassEdges();
    Utils.updateCopyrightYear();
    Utils.hideLoader();

    pubSub.publish('upsell:initialized', { locale: I18n.getCurrentLocale() });

    isInitialized = true;
  };

  const destroy = function destroy() {
    if (!isInitialized) {
      return;
    }

    cleanup();

    if (glassEdgesCleanup) {
      glassEdgesCleanup();
      glassEdgesCleanup = null;
    }

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
