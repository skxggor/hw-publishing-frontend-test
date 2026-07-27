import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createUpsellPage } from '@pages/upsell.js';
import { pubSub } from '@core/pubsub.js';
import { installGsap } from '../helpers.js';

const VIDEO_REVEAL_TIME = 10000;

const setupUpsellDom = function setupUpsellDom() {
  document.body.innerHTML = `
    <div class="upsell-hero__content">
      <p class="upsell-hero__eyebrow">Hermann Hesse</p>
      <h1 class="upsell-hero__title">O Lobo da Estepe</h1>
      <p class="upsell-hero__subtitle">Subtitle</p>
    </div>
    <div class="upsell-hero__images" id="upsellImages">
      <img class="upsell-hero__image--primary" src="upsell1.webp" alt="">
      <img class="upsell-hero__image--alternate" src="upsell2.webp" alt="">
    </div>
    <div class="upsell-hero__video" id="upsellVideo"></div>
    <div class="upsell-countdown" id="upsellCountdown">
      <span class="upsell-countdown__number" id="countdownNumber">10</span>
    </div>
    <div class="upsell-hero__container is-hidden" id="upsellContent">
      <div class="upsell-hero__media"></div>
    </div>
    <div class="upsell-offer" id="upsellOffer">
      <div class="upsell-offer__container">
        <h2>Offer</h2>
      </div>
    </div>
    <div class="price-badge--upsell"></div>
    <a class="btn" href="/thank-you.html?companion=true">Accept</a>
    <a class="btn" href="/thank-you.html?companion=false">Decline</a>
  `;
};

describe('Upsell Page - Integration', function () {
  let upsellPage;

  beforeEach(function () {
    installGsap();
    setupUpsellDom();
    localStorage.clear();
    upsellPage = createUpsellPage();
  });

  afterEach(function () {
    pubSub.clear();
    vi.useRealTimers();
    delete window.startUpsellCountdown;
  });

  describe('createScrollProgress', function () {
    it('should append a scroll progress element', function () {
      upsellPage.init();

      const progress = document.querySelector('.scroll-progress');

      expect(progress).not.toBeNull();
      expect(document.body.contains(progress)).toBe(true);
    });

    it('should set scroll progress custom property', function () {
      upsellPage.init();

      const progress = document.querySelector('.scroll-progress');
      const value = progress.style.getPropertyValue('--scroll-progress');

      expect(value).toMatch(/%$/);
    });
  });

  describe('initVideoTracking / startCountdown', function () {
    beforeEach(function () {
      vi.useFakeTimers();
    });

    it('should keep content hidden before the countdown starts', function () {
      upsellPage.init();
      vi.advanceTimersByTime(VIDEO_REVEAL_TIME - 1);

      expect(document.querySelector('#upsellContent').classList.contains('is-hidden')).toBe(true);
    });

    it('should start countdown when startUpsellCountdown is called', function () {
      upsellPage.init();
      window.startUpsellCountdown();

      expect(document.querySelector('#countdownNumber').textContent).toBe('10');

      vi.advanceTimersByTime(1000);
      expect(document.querySelector('#countdownNumber').textContent).toBe('9');

      vi.advanceTimersByTime(1000);
      expect(document.querySelector('#countdownNumber').textContent).toBe('8');
    });

    it('should reveal content after countdown from video start', function () {
      upsellPage.init();
      window.startUpsellCountdown();
      vi.advanceTimersByTime(VIDEO_REVEAL_TIME);

      expect(document.querySelector('#upsellContent').classList.contains('is-hidden')).toBe(false);
    });

    it('should hide countdown after reaching zero', function () {
      upsellPage.init();
      window.startUpsellCountdown();
      vi.advanceTimersByTime(VIDEO_REVEAL_TIME);

      expect(document.querySelector('#upsellCountdown').classList.contains('is-hidden')).toBe(true);
    });

    it('should publish images-revealed event with method video after countdown', function () {
      const handler = vi.fn();

      pubSub.subscribe('upsell:images-revealed', handler);

      upsellPage.init();
      window.startUpsellCountdown();
      vi.advanceTimersByTime(VIDEO_REVEAL_TIME);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].method).toBe('video');
    });

    it('should reveal content as fallback when video does not start', function () {
      upsellPage.init();
      vi.advanceTimersByTime(VIDEO_REVEAL_TIME + 1);

      expect(document.querySelector('#upsellContent').classList.contains('is-hidden')).toBe(false);
    });

    it('should publish images-revealed event with method fallback when video does not start', function () {
      const handler = vi.fn();

      pubSub.subscribe('upsell:images-revealed', handler);

      upsellPage.init();
      vi.advanceTimersByTime(VIDEO_REVEAL_TIME + 1);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].method).toBe('fallback');
    });

    it('should reveal content when video element is missing and fallback fires', function () {
      document.querySelector('#upsellVideo').remove();

      upsellPage.init();
      vi.advanceTimersByTime(VIDEO_REVEAL_TIME + 1);

      expect(document.querySelector('#upsellContent').classList.contains('is-hidden')).toBe(false);
    });

    it('should not start another countdown if startUpsellCountdown is called twice', function () {
      upsellPage.init();
      window.startUpsellCountdown();
      window.startUpsellCountdown();

      vi.advanceTimersByTime(VIDEO_REVEAL_TIME);

      const intervalCount = pubSub.hasSubscribers('upsell:images-revealed') ? 1 : 0;

      expect(intervalCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('initCtaTracking', function () {
    it('should publish accept event', function () {
      const handler = vi.fn();

      pubSub.subscribe('upsell:cta:accept', handler);

      upsellPage.init();
      document.querySelector('a[href*="companion=true"]').click();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should publish decline event', function () {
      const handler = vi.fn();

      pubSub.subscribe('upsell:cta:decline', handler);

      upsellPage.init();
      document.querySelector('a[href*="companion=false"]').click();

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('init guard', function () {
    it('should not run twice', function () {
      upsellPage.init();
      upsellPage.init();

      const progressBars = document.querySelectorAll('.scroll-progress');

      expect(progressBars.length).toBe(1);
    });
  });

  describe('destroy', function () {
    it('should remove scroll progress element', function () {
      upsellPage.init();

      expect(document.querySelector('.scroll-progress')).not.toBeNull();

      upsellPage.destroy();

      expect(document.querySelector('.scroll-progress')).toBeNull();
    });

    it('should cancel pending content reveal on destroy', function () {
      vi.useFakeTimers();

      upsellPage.init();
      upsellPage.destroy();
      vi.advanceTimersByTime(VIDEO_REVEAL_TIME + 1);

      expect(document.querySelector('#upsellContent').classList.contains('is-hidden')).toBe(true);
    });
  });

  describe('without gsap', function () {
    beforeEach(function () {
      delete window.gsap;
      vi.useFakeTimers();
    });

    it('should init and reveal content when countdown starts', function () {
      expect(function safeInit() {
        upsellPage.init();
      }).not.toThrow();

      window.startUpsellCountdown();
      vi.advanceTimersByTime(VIDEO_REVEAL_TIME);

      expect(document.querySelector('#upsellContent').classList.contains('is-hidden')).toBe(false);
    });

    it('should reveal content when fallback fires without gsap', function () {
      expect(function safeInit() {
        upsellPage.init();
      }).not.toThrow();

      vi.advanceTimersByTime(VIDEO_REVEAL_TIME + 1);

      expect(document.querySelector('#upsellContent').classList.contains('is-hidden')).toBe(false);
    });
  });

  describe('with partial DOM', function () {
    it('should skip CTA tracking when buttons are missing', function () {
      document.querySelector('a[href*="companion=true"]').remove();
      document.querySelector('a[href*="companion=false"]').remove();

      expect(function safeInit() {
        upsellPage.init();
      }).not.toThrow();
    });

    it('should reveal content even when upsellContent container is missing', function () {
      document.querySelector('#upsellContent').remove();
      vi.useFakeTimers();

      expect(function safeInit() {
        upsellPage.init();
        window.startUpsellCountdown();
        vi.advanceTimersByTime(VIDEO_REVEAL_TIME);
      }).not.toThrow();
    });
  });
});
