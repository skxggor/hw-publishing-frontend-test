import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createThankYouPage } from '@pages/thank-you.js';
import { pubSub } from '@core/pubsub.js';
import { installGsap, installIntersectionObserver } from '../helpers.js';

const setupThankYouDom = function setupThankYouDom() {
  document.body.innerHTML = `
    <div class="thank-you-hero__container">
      <div class="thank-you-hero__media"></div>
      <div class="thank-you-hero__content"></div>
    </div>
    <section class="order-summary">
      <span id="orderNumber"></span>
      <div id="companionItem" class="is-hidden order-summary__item--bonus"></div>
      <span id="orderTotal">R$ 0,00</span>
    </section>
    <div class="step-card"><div class="step-card__icon">1</div></div>
    <div class="thank-you-hero__actions">
      <a class="btn btn--secondary" href="#">Voltar</a>
    </div>
  `;
};

const setCompanionParam = function setCompanionParam(value) {
  window.history.replaceState({}, '', `/thank-you.html?companion=${value}`);
};

describe('Thank You Page - Integration', function () {
  let thankYouPage;

  beforeEach(function () {
    installGsap();
    installIntersectionObserver();
    setupThankYouDom();
    localStorage.clear();
    thankYouPage = createThankYouPage();
  });

  afterEach(function () {
    pubSub.clear();
  });

  describe('updateOrderSummary', function () {
    it('should generate and display an order number', function () {
      thankYouPage.init();

      const orderNumber = document.querySelector('#orderNumber').textContent;

      expect(orderNumber).toMatch(/^#HWP-\d+-\d+$/);
    });

    it('should reveal companion item when companion=true', function () {
      setCompanionParam('true');

      thankYouPage.init();

      const companionItem = document.querySelector('#companionItem');

      expect(companionItem.classList.contains('is-hidden')).toBe(false);
    });

    it('should update order total when companion accepted', function () {
      setCompanionParam('true');

      thankYouPage.init();

      expect(document.querySelector('#orderTotal').textContent).toBe('R$ 169,98');
    });

    it('should keep companion item hidden when companion=false', function () {
      setCompanionParam('false');

      thankYouPage.init();

      const companionItem = document.querySelector('#companionItem');

      expect(companionItem.classList.contains('is-hidden')).toBe(true);
    });

    it('should keep companion item hidden without param', function () {
      window.history.replaceState({}, '', '/thank-you.html');

      thankYouPage.init();

      expect(document.querySelector('#companionItem').classList.contains('is-hidden')).toBe(true);
    });

    it('should persist order to localStorage', function () {
      thankYouPage.init();

      const stored = JSON.parse(localStorage.getItem('lastOrder'));

      expect(stored).toBeDefined();
      expect(stored.orderNumber).toMatch(/^#HWP-/);
      expect(stored.companion).toBe(false);
      expect(stored.timestamp).toBeDefined();
    });

    it('should publish order-updated event', function () {
      const handler = vi.fn();

      pubSub.subscribe('thank-you:order-updated', handler);

      thankYouPage.init();

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].companion).toBe(false);
    });
  });

  describe('initConfettiEffect', function () {
    it('should create confetti particles', function () {
      thankYouPage.init();

      const confetti = document.querySelectorAll('.thank-you-hero__container .confetti');

      expect(confetti.length).toBe(50);
    });

    it('should not create confetti when container is missing', function () {
      document.querySelector('.thank-you-hero__container').remove();

      expect(function safeInit() {
        thankYouPage.init();
      }).not.toThrow();
    });
  });

  describe('initStepAnimations', function () {
    it('should mark step cards as visible when intersecting', function () {
      thankYouPage.init();

      const visibleSteps = document.querySelectorAll('.step-card.is-visible');

      expect(visibleSteps.length).toBe(1);
    });
  });

  describe('initCtaTracking', function () {
    it('should publish secondary CTA event on click', function () {
      const handler = vi.fn();

      pubSub.subscribe('thank-you:cta:secondary-clicked', handler);

      thankYouPage.init();
      document.querySelector('.btn--secondary').click();

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('init guard', function () {
    it('should not run twice', function () {
      thankYouPage.init();
      thankYouPage.init();

      const confetti = document.querySelectorAll('.confetti');

      expect(confetti.length).toBe(50);
    });
  });

  describe('destroy', function () {
    it('should clear initialized state allowing re-init', function () {
      thankYouPage.init();
      thankYouPage.destroy();

      document.querySelector('.thank-you-hero__container').innerHTML = '';
      thankYouPage.init();

      const confetti = document.querySelectorAll('.confetti');

      expect(confetti.length).toBe(50);
    });
  });

  describe('without gsap', function () {
    beforeEach(function () {
      delete window.gsap;
    });

    it('should still init, reveal confetti and mark steps without animation', function () {
      expect(function safeInit() {
        thankYouPage.init();
      }).not.toThrow();

      expect(document.querySelectorAll('.confetti').length).toBe(50);
      expect(document.querySelectorAll('.step-card.is-visible').length).toBe(1);
    });
  });

  describe('with partial DOM', function () {
    it('should init when companion item is missing', function () {
      document.querySelector('#companionItem').remove();

      expect(function safeInit() {
        thankYouPage.init();
      }).not.toThrow();
    });

    it('should init when order total is missing', function () {
      document.querySelector('#orderTotal').remove();

      expect(function safeInit() {
        thankYouPage.init();
      }).not.toThrow();
    });

    it('should skip CTA tracking when button is missing', function () {
      document.querySelector('.btn--secondary').remove();

      expect(function safeInit() {
        thankYouPage.init();
      }).not.toThrow();
    });

    it('should skip step animations when no step cards exist', function () {
      document.querySelector('.step-card').remove();

      expect(function safeInit() {
        thankYouPage.init();
      }).not.toThrow();
    });
  });
});
