import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createUpsellPage } from '@pages/upsell.js';
import { pubSub } from '@core/pubsub.js';
import { installGsap } from '../helpers.js';

const CONTENT_REVEAL_DELAY = 15000;

const setupUpsellDom = function setupUpsellDom() {
  document.body.innerHTML = `
    <div class="upsell-hero__container"><h1>Title</h1></div>
    <div class="video-section__wrapper">
      <iframe id="upsellVideo" src="https://example.com"></iframe>
    </div>
    <div id="upsellContent" class="is-hidden"></div>
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

  describe('initVideoTracking / revealHiddenContent', function () {
    beforeEach(function () {
      vi.useFakeTimers();
    });

    it('should keep content hidden before the delay', function () {
      upsellPage.init();
      vi.advanceTimersByTime(CONTENT_REVEAL_DELAY - 1);

      expect(document.querySelector('#upsellContent').classList.contains('is-hidden')).toBe(true);
    });

    it('should reveal content after the delay', function () {
      upsellPage.init();
      vi.advanceTimersByTime(CONTENT_REVEAL_DELAY);

      expect(document.querySelector('#upsellContent').classList.contains('is-hidden')).toBe(false);
    });

    it('should publish content-revealed event after delay', function () {
      const handler = vi.fn();

      pubSub.subscribe('upsell:content-revealed', handler);

      upsellPage.init();
      vi.advanceTimersByTime(CONTENT_REVEAL_DELAY);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].method).toBe('timeout');
    });

    it('should still reveal when video iframe is missing', function () {
      document.querySelector('#upsellVideo').remove();

      upsellPage.init();
      vi.advanceTimersByTime(CONTENT_REVEAL_DELAY);

      expect(document.querySelector('#upsellContent').classList.contains('is-hidden')).toBe(false);
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

    it('should cancel pending content reveal', function () {
      vi.useFakeTimers();

      upsellPage.init();
      upsellPage.destroy();
      vi.advanceTimersByTime(CONTENT_REVEAL_DELAY);

      expect(document.querySelector('#upsellContent').classList.contains('is-hidden')).toBe(true);
    });
  });

  describe('without gsap', function () {
    beforeEach(function () {
      delete window.gsap;
      vi.useFakeTimers();
    });

    it('should init and reveal content without animation', function () {
      expect(function safeInit() {
        upsellPage.init();
      }).not.toThrow();

      vi.advanceTimersByTime(CONTENT_REVEAL_DELAY);

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

    it('should reveal content even when target container is missing', function () {
      document.querySelector('#upsellContent').remove();
      vi.useFakeTimers();

      expect(function safeInit() {
        upsellPage.init();
        vi.advanceTimersByTime(CONTENT_REVEAL_DELAY);
      }).not.toThrow();
    });
  });
});
