import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createHomePage } from '@pages/index.js';
import { pubSub } from '@core/pubsub.js';
import { installIntersectionObserver } from '../helpers.js';

const setupHomeDom = function setupHomeDom() {
  document.body.innerHTML = `
    <header class="header"></header>
    <button id="mobileMenuToggle">Menu</button>
    <button id="languageToggle"><span id="currentLanguage">PT</span></button>
    <span data-i18n="header.home">Início</span>
    <article class="testimonial-card">A</article>
    <article class="testimonial-card">B</article>
    <a class="btn btn--primary" href="#">Comprar</a>
  `;
};

describe('Home Page - Integration', function () {
  let homePage;

  beforeEach(function () {
    setupHomeDom();
    localStorage.clear();
    Object.defineProperty(navigator, 'language', { value: 'pt-BR', configurable: true });
    homePage = createHomePage();
  });

  afterEach(function () {
    pubSub.clear();
    vi.useRealTimers();
  });

  describe('initLanguageToggle', function () {
    it('should switch to en-US and update label on click', function () {
      homePage.init();

      document.querySelector('#languageToggle').click();

      expect(document.querySelector('#currentLanguage').textContent).toBe('EN');
      expect(document.querySelector('[data-i18n="header.home"]').textContent).toBe('Home');
    });

    it('should switch back to pt-BR on second click', function () {
      homePage.init();

      document.querySelector('#languageToggle').click();
      document.querySelector('#languageToggle').click();

      expect(document.querySelector('#currentLanguage').textContent).toBe('PT');
      expect(document.querySelector('[data-i18n="header.home"]').textContent).toBe('Início');
    });

    it('should publish language:changed event', function () {
      const handler = vi.fn();

      pubSub.subscribe('language:changed', handler);

      homePage.init();
      document.querySelector('#languageToggle').click();

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0]).toBe('en-US');
    });
  });

  describe('initMobileMenu', function () {
    it('should toggle header menu class on click', function () {
      homePage.init();

      const header = document.querySelector('.header');

      document.querySelector('#mobileMenuToggle').click();
      expect(header.classList.contains('header--menu-open')).toBe(true);

      document.querySelector('#mobileMenuToggle').click();
      expect(header.classList.contains('header--menu-open')).toBe(false);
    });
  });

  describe('initCtaTracking', function () {
    it('should publish cta:clicked with button text and page', function () {
      const handler = vi.fn();

      pubSub.subscribe('cta:clicked', handler);

      homePage.init();
      document.querySelector('.btn--primary').click();

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0]).toEqual({ button: 'Comprar', page: 'landing' });
    });
  });

  describe('initTestimonialSlider', function () {
    beforeEach(function () {
      vi.useFakeTimers();
    });

    it('should activate the first testimonial on init', function () {
      homePage.init();

      const active = document.querySelectorAll('.testimonial-card--active');

      expect(active.length).toBe(1);
      expect(document.querySelectorAll('.testimonial-card')[0].classList.contains('testimonial-card--active')).toBe(true);
    });

    it('should advance to the next testimonial after the interval', function () {
      homePage.init();

      vi.advanceTimersByTime(5000);

      const cards = document.querySelectorAll('.testimonial-card');

      expect(cards[0].classList.contains('testimonial-card--active')).toBe(false);
      expect(cards[1].classList.contains('testimonial-card--active')).toBe(true);
    });

    it('should loop back to the first testimonial', function () {
      homePage.init();

      vi.advanceTimersByTime(10000);

      const cards = document.querySelectorAll('.testimonial-card');

      expect(cards[0].classList.contains('testimonial-card--active')).toBe(true);
    });
  });

  describe('initHeaderScroll', function () {
    beforeEach(function () {
      vi.useFakeTimers();
    });

    it('should add scrolled class when scrolled past threshold', function () {
      homePage.init();

      Object.defineProperty(window, 'pageYOffset', { value: 150, configurable: true, writable: true });
      window.dispatchEvent(new Event('scroll'));

      expect(document.querySelector('.header').classList.contains('header--scrolled')).toBe(true);
    });

    it('should remove scrolled class when scrolled back to top', function () {
      homePage.init();

      Object.defineProperty(window, 'pageYOffset', { value: 150, configurable: true, writable: true });
      window.dispatchEvent(new Event('scroll'));

      vi.advanceTimersByTime(150);

      Object.defineProperty(window, 'pageYOffset', { value: 0, configurable: true, writable: true });
      window.dispatchEvent(new Event('scroll'));

      expect(document.querySelector('.header').classList.contains('header--scrolled')).toBe(false);
    });
  });

  describe('init guard', function () {
    it('should not run twice', function () {
      const handler = vi.fn();

      pubSub.subscribe('landing:initialized', handler);

      homePage.init();
      homePage.init();

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('initSmoothScroll', function () {
    it('should ignore anchors with empty hash target', function () {
      const link = document.createElement('a');

      link.href = '#';
      document.body.appendChild(link);

      expect(function clickEmptyHash() {
        homePage.init();
        link.click();
      }).not.toThrow();
    });

    it('should scroll to a real anchor target without errors', function () {
      const target = document.createElement('div');
      const link = document.createElement('a');

      target.id = 'features';
      link.href = '#features';
      document.body.append(target, link);

      expect(function clickRealAnchor() {
        homePage.init();
        link.click();
      }).not.toThrow();
    });
  });

  describe('initScrollAnimations', function () {
    it('should reveal data-animate elements when intersecting', function () {
      installIntersectionObserver();

      const animated = document.createElement('div');

      animated.setAttribute('data-animate', '');
      document.body.appendChild(animated);

      homePage.init();

      expect(animated.classList.contains('is-visible')).toBe(true);
    });
  });

  describe('with partial DOM', function () {
    it('should skip language toggle when missing', function () {
      document.querySelector('#languageToggle').remove();

      expect(function safeInit() {
        homePage.init();
      }).not.toThrow();
    });

    it('should skip mobile menu when toggle is missing', function () {
      document.querySelector('#mobileMenuToggle').remove();

      expect(function safeInit() {
        homePage.init();
      }).not.toThrow();
    });

    it('should skip testimonials slider when cards are missing', function () {
      document.querySelectorAll('.testimonial-card').forEach(function remove(card) {
        card.remove();
      });

      expect(function safeInit() {
        homePage.init();
      }).not.toThrow();
    });
  });
});
