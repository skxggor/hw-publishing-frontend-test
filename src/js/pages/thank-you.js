import '@css/styles.css';
import '@core/view-transitions.js';

import { pubSub } from '@core/pubsub.js';
import Utils from '@core/utils.js';
import I18n from '@core/i18n.js';

const CONFETTI_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const CONFETTI_COUNT = 50;

const generateOrderNumber = function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 9000) + 1000;

  return `#HWP-${timestamp}-${random}`;
};

const createThankYouPage = function createThankYouPage() {
  let isInitialized = false;

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
          orderTotal.textContent = 'R$ 694,00';
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
    if (!window.gsap) {
      return;
    }

    const timeline = window.gsap.timeline();

    timeline.fromTo(
      '.thank-you-hero__container > *',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power2.out' }
    );

    timeline.fromTo(
      '.order-summary__card',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' },
      '-=0.4'
    );

    timeline.fromTo(
      '.step-card',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.2, ease: 'power2.out' },
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

        const number = entry.target.querySelector('.step-card__number');

        if (number && window.gsap) {
          window.gsap.fromTo(
            number,
            { scale: 0.5, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
          );
        }

        observer.unobserve(entry.target);
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.5,
      rootMargin: '0px 0px -100px 0px',
    });

    stepCards.forEach(function observeStep(card) {
      observer.observe(card);
    });
  };

  const initCtaTracking = function initCtaTracking() {
    const primaryCta = Utils.getElement('.cta-section .btn--primary');
    const secondaryCta = Utils.getElement('.cta-section .btn--secondary');

    if (!primaryCta || !secondaryCta) {
      return;
    }

    primaryCta.addEventListener('click', function trackPrimary() {
      const orderData = Utils.getFromLocalStorage('lastOrder');

      pubSub.publish('thank-you:cta:primary-clicked', {
        orderNumber: orderData ? orderData.orderNumber : 'unknown',
        timestamp: Date.now(),
      });
    });

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

    if (window.gsap) {
      window.gsap.to(particle, {
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
    updateOrderSummary();
    initEntranceAnimations();
    initStepAnimations();
    initCtaTracking();
    initConfettiEffect();

    pubSub.publish('thank-you:initialized', { locale: I18n.getCurrentLocale() });

    isInitialized = true;
  };

  const destroy = function destroy() {
    if (!isInitialized) {
      return;
    }

    pubSub.clear('thank-you:initialized');
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
