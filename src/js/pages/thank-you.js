import '@css/styles.css';
import '@core/view-transitions.js';

import { pubSub } from '@core/pubsub.js';
import Utils from '@core/utils.js';
import I18n from '@core/i18n.js';
import { mountGlassEdges } from '@features/layout/glass-edges.js';
import { initPageTransition } from '@features/layout/transition.js';
import { gsap } from 'gsap';

const CONFETTI_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const CONFETTI_COUNT = 50;
const EASE_OUT = 'power2.out';
const EASE_BACK = 'back.out(1.7)';
const ORDER_TOTAL_WITH_COMPANION = 'R$ 169,98';
const STEP_REVEAL_ROOT_MARGIN = '0px 0px -100px 0px';
const STEP_REVEAL_THRESHOLD = 0.5;

const generateOrderNumber = function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 9000) + 1000;

  return `#HWP-${timestamp}-${random}`;
};

const createThankYouPage = function createThankYouPage() {
  let isInitialized = false;
  let glassEdgesCleanup = null;

  const prefersReducedMotion = function prefersReducedMotion() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

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

  const updateOrderSummary = function updateOrderSummary() {
    const orderNumberElement = Utils.getElement('#orderNumber');
    const companionItem = Utils.getElement('#companionItem');
    const orderTotal = Utils.getElement('#orderTotal');

    if (!orderNumberElement) {
      return;
    }

    const orderNumber = generateOrderNumber();

    orderNumberElement.textContent = orderNumber;

    const urlParameters = new URLSearchParams(window.location.search);
    const acceptedCompanion = urlParameters.get('companion') === 'true';

    if (companionItem) {
      if (acceptedCompanion) {
        Utils.removeClass(companionItem, 'is-hidden');

        if (orderTotal) {
          orderTotal.textContent = ORDER_TOTAL_WITH_COMPANION;
        }
      } else {
        Utils.addClass(companionItem, 'is-hidden');
      }
    }

    Utils.saveToLocalStorage('lastOrder', {
      orderNumber: orderNumber,
      companion: acceptedCompanion,
      timestamp: Date.now(),
    });

    pubSub.publish('thank-you:order-updated', {
      orderNumber: orderNumber,
      companion: acceptedCompanion,
    });
  };

  const initEntranceAnimations = function initEntranceAnimations() {
    if (prefersReducedMotion()) {
      return;
    }

    const timeline = gsap.timeline();

    timeline.fromTo(
      '.thank-you-hero__container > *',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: EASE_OUT }
    );

    timeline.fromTo(
      '.order-summary__card',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: EASE_BACK },
      '-=0.4'
    );

    timeline.fromTo(
      '.step-card',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.2, ease: EASE_OUT },
      '-=0.3'
    );
  };

  const initStepAnimations = function initStepAnimations() {
    const stepCards = Utils.getElements('.step-card');

    if (stepCards.length === 0) {
      return;
    }

    const observerCallback = function observerCallback(entries, observer) {
      entries.forEach(function animateStep(entry) {
        if (!entry.isIntersecting) {
          return;
        }

        Utils.addClass(entry.target, 'is-visible');

        const icon = entry.target.querySelector('.step-card__icon');

        if (icon && !prefersReducedMotion()) {
          gsap.fromTo(
            icon,
            { scale: 0.5, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: EASE_BACK }
          );
        }

        observer.unobserve(entry.target);
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: STEP_REVEAL_ROOT_MARGIN,
      threshold: STEP_REVEAL_THRESHOLD,
    });

    stepCards.forEach(function observeStep(card) {
      observer.observe(card);
    });
  };

  const initCtaTracking = function initCtaTracking() {
    const secondaryCta = Utils.getElement('.thank-you-hero__actions .btn--secondary');

    if (!secondaryCta) {
      return;
    }

    secondaryCta.addEventListener('click', function trackSecondary() {
      pubSub.publish('thank-you:cta:secondary-clicked', { timestamp: Date.now() });
    });
  };

  const createConfettiParticle = function createConfettiParticle(container, index) {
    const particle = document.createElement('div');
    const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
    const horizontalPosition = Math.random() * 100;
    const delay = Math.random() * 2;
    const duration = 2 + Math.random() * 2;

    Utils.addClass(particle, 'confetti');
    particle.style.setProperty('--confetti-color', color);
    particle.style.setProperty('--confetti-x', `${horizontalPosition}%`);
    particle.style.setProperty('--confetti-delay', `${delay}s`);
    particle.style.setProperty('--confetti-duration', `${duration}s`);

    container.appendChild(particle);

    if (!prefersReducedMotion()) {
      gsap.to(particle, {
        y: window.innerHeight + 100,
        rotation: Math.random() * 720 - 360,
        opacity: 1,
        duration: duration,
        delay: delay,
        ease: 'power1.in',
        onComplete: function removeParticle() {
          particle.remove();
        },
      });
    }
  };

  const initConfettiEffect = function initConfettiEffect() {
    const container = Utils.getElement('.thank-you-hero__container');

    if (!container) {
      return;
    }

    for (let index = 0; index < CONFETTI_COUNT; index++) {
      createConfettiParticle(container, index);
    }
  };

  const init = function init() {
    if (isInitialized) {
      return;
    }

    I18n.init();
    initPageTransition();
    initLanguageToggle();
    updateOrderSummary();
    initEntranceAnimations();
    initStepAnimations();
    initCtaTracking();
    initConfettiEffect();
    glassEdgesCleanup = mountGlassEdges();
    Utils.updateCopyrightYear();

    pubSub.publish('thank-you:initialized', { locale: I18n.getCurrentLocale() });

    isInitialized = true;
  };

  const destroy = function destroy() {
    if (!isInitialized) {
      return;
    }

    pubSub.clear('thank-you:initialized');

    if (glassEdgesCleanup) {
      glassEdgesCleanup();
      glassEdgesCleanup = null;
    }

    isInitialized = false;
  };

  return Object.freeze({ init, destroy });
};

const thankYouPage = createThankYouPage();

document.addEventListener('DOMContentLoaded', function startThankYou() {
  thankYouPage.init();
});

export { createThankYouPage };
export default thankYouPage;
