import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installIntersectionObserver } from '../helpers.js';

vi.mock('gsap', () => {
  const chain = {
    eventCallback: vi.fn(function returnChain() { return chain; }),
    set: vi.fn(function returnChain() { return chain; }),
    to: vi.fn(function returnChain() { return chain; }),
  };

  return {
    gsap: {
      to: vi.fn(),
      timeline: vi.fn(function createTimeline() { return chain; }),
    },
  };
});

const { emblaApi } = vi.hoisted(() => ({
  emblaApi: {
    scrollSnapList: () => [0, 0, 0],
    selectedScrollSnap: () => 0,
    scrollTo: vi.fn(),
    scrollPrev: vi.fn(),
    scrollNext: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock('embla-carousel', () => ({ default: vi.fn(() => emblaApi) }));
vi.mock('embla-carousel-autoplay', () => ({ default: vi.fn() }));

import EmblaCarousel from 'embla-carousel';
import { gsap } from 'gsap';
import { createHomePage } from '@pages/index.js';
import { pubSub } from '@core/pubsub.js';

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

    it('should toggle aria-expanded with the menu state', function () {
      homePage.init();

      const toggle = document.querySelector('#mobileMenuToggle');

      toggle.click();
      expect(toggle.getAttribute('aria-expanded')).toBe('true');

      toggle.click();
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });

    it('should close the menu on Escape', function () {
      homePage.init();

      const header = document.querySelector('.header');

      document.querySelector('#mobileMenuToggle').click();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(header.classList.contains('header--menu-open')).toBe(false);
    });

    it('should close the menu when a nav link is clicked', function () {
      const link = document.createElement('a');

      link.className = 'header__link';
      link.href = '#x';
      document.body.appendChild(link);

      homePage.init();

      const header = document.querySelector('.header');

      document.querySelector('#mobileMenuToggle').click();
      link.click();

      expect(header.classList.contains('header--menu-open')).toBe(false);
    });

    it('should play the reverse closing stagger and clear it afterwards', function () {
      vi.useFakeTimers();

      homePage.init();

      const header = document.querySelector('.header');
      const toggle = document.querySelector('#mobileMenuToggle');

      toggle.click();
      toggle.click();

      expect(header.classList.contains('header--menu-open')).toBe(false);
      expect(header.classList.contains('header--menu-closing')).toBe(true);

      vi.advanceTimersByTime(900);

      expect(header.classList.contains('header--menu-closing')).toBe(false);

      vi.useRealTimers();
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

  describe('initCarousels', function () {
    it('should mount carousels found in the DOM', function () {
      const root = document.createElement('div');
      const viewport = document.createElement('div');

      root.setAttribute('data-carousel', '');
      viewport.setAttribute('data-carousel-viewport', '');
      root.appendChild(viewport);
      document.body.appendChild(root);

      homePage.init();

      expect(EmblaCarousel).toHaveBeenCalled();
    });

    it('should skip when there are no carousels', function () {
      homePage.init();

      expect(EmblaCarousel).not.toHaveBeenCalled();
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

    it('should skip data-animate elements that are not intersecting', function () {
      global.IntersectionObserver = vi.fn().mockImplementation(function createObserver(callback) {
        return {
          observe: function observe(target) {
            callback([{ isIntersecting: false, target: target }], this);
          },
          unobserve: vi.fn(),
          disconnect: vi.fn(),
        };
      });

      const animated = document.createElement('div');

      animated.setAttribute('data-animate', '');
      document.body.appendChild(animated);

      homePage.init();

      expect(animated.classList.contains('is-visible')).toBe(false);
    });
  });

  describe('initHeroFloat', function () {
    afterEach(function () {
      window.matchMedia = vi.fn().mockImplementation(function defaultMediaQueryList() {
        return { matches: false };
      });
    });

    it('floats the hero media when gsap is available', function () {
      const media = document.createElement('div');

      media.className = 'hero__media';
      document.body.appendChild(media);

      homePage.init();

      expect(gsap.to).toHaveBeenCalledTimes(1);
    });

    it('skips when there is no hero media', function () {
      homePage.init();

      expect(gsap.to).not.toHaveBeenCalled();
    });

    it('skips when the user prefers reduced motion', function () {
      window.matchMedia = vi.fn().mockImplementation(function createReducedMotionList() {
        return { matches: true };
      });

      const media = document.createElement('div');

      media.className = 'hero__media';
      document.body.appendChild(media);

      homePage.init();

      expect(gsap.to).not.toHaveBeenCalled();
    });
  });

  describe('initHeroCrossfade', function () {
    afterEach(function () {
      window.matchMedia = vi.fn().mockImplementation(function defaultMediaQueryList() {
        return { matches: false };
      });
    });

    const buildHeroImages = function buildHeroImages() {
      const primary = document.createElement('img');
      const alternate = document.createElement('img');

      primary.className = 'hero__image hero__image--primary';
      alternate.className = 'hero__image hero__image--alternate';
      document.body.append(primary, alternate);
    };

    it('crossfades both hero images when gsap is available', function () {
      buildHeroImages();

      homePage.init();

      expect(gsap.timeline).toHaveBeenCalledTimes(1);
    });

    it('skips when an image is missing', function () {
      const primary = document.createElement('img');

      primary.className = 'hero__image hero__image--primary';
      document.body.appendChild(primary);

      homePage.init();

      expect(gsap.timeline).not.toHaveBeenCalled();
    });

    it('skips when the user prefers reduced motion', function () {
      window.matchMedia = vi.fn().mockImplementation(function createReducedMotionList() {
        return { matches: true };
      });

      buildHeroImages();

      homePage.init();

      expect(gsap.timeline).not.toHaveBeenCalled();
    });
  });

  describe('destroy', function () {
    const buildCarousel = function buildCarousel() {
      const root = document.createElement('div');
      const viewport = document.createElement('div');

      root.setAttribute('data-carousel', '');
      viewport.setAttribute('data-carousel-viewport', '');
      root.appendChild(viewport);
      document.body.appendChild(root);

      return root;
    };

    it('should tear down mounted carousels', function () {
      buildCarousel();

      homePage.init();
      homePage.destroy();

      expect(emblaApi.destroy).toHaveBeenCalled();
    });

    it('should be a no-op before init', function () {
      expect(function safeDestroy() {
        homePage.destroy();
      }).not.toThrow();
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
  });
});
