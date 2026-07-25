import '@css/styles.css';
import '@core/view-transitions.js';

import { pubSub } from '@core/pubsub.js';
import Utils from '@core/utils.js';
import I18n from '@core/i18n.js';
import { mountGlassEdges } from '@features/layout/glass-edges.js';
import { mountCarousels } from '@features/landing/carousel.js';
import { initPageTransition } from '@features/layout/transition.js';
import { gsap } from 'gsap';

const prefersReducedMotion = function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const EASE_SMOOTH = 'sine.inOut';
const EASE_SOFT = 'power2.inOut';
const HERO_CROSSFADE_DURATION = 1.2;
const HERO_CROSSFADE_HOLD = 5;
const HERO_FLOAT_DISTANCE = -14;
const HERO_FLOAT_DURATION = 2.6;
const MENU_CLOSE_DURATION = 900;
const PAGE_NAME = 'landing';
const REVEAL_ROOT_MARGIN = '0px 0px -50px 0px';
const REVEAL_THRESHOLD = 0.1;
const SMOOTH_SCROLL_OFFSET = 80;

const createHomePage = function createHomePage() {
  let isInitialized = false;

  let carouselInstances = [];

  let glassEdgesCleanup = null;

  const initMobileMenu = function initMobileMenu() {
    const toggleButton = Utils.getElement('#mobileMenuToggle');
    const header = Utils.getElement('.header');
    const navLinks = Utils.getElements('.header__link');

    if (!toggleButton || !header) {
      return;
    }

    let closeTimeout = null;

    const clearCloseTimeout = function clearCloseTimeout() {
      if (!closeTimeout) {
        return;
      }

      clearTimeout(closeTimeout);
      closeTimeout = null;
    };

    const closeMenu = function closeMenu() {
      clearCloseTimeout();
      Utils.removeClass(header, 'header--menu-open');
      Utils.addClass(header, 'header--menu-closing');
      Utils.removeClass(document.body, 'body--menu-open');
      toggleButton.setAttribute('aria-expanded', 'false');

      closeTimeout = setTimeout(function finishClosing() {
        Utils.removeClass(header, 'header--menu-closing');
        closeTimeout = null;
      }, MENU_CLOSE_DURATION);
    };

    const openMenu = function openMenu() {
      clearCloseTimeout();
      Utils.removeClass(header, 'header--menu-closing');
      Utils.addClass(header, 'header--menu-open');
      Utils.addClass(document.body, 'body--menu-open');
      toggleButton.setAttribute('aria-expanded', 'true');
    };

    const toggleMenu = function toggleMenu() {
      if (Utils.hasClass(header, 'header--menu-open')) {
        closeMenu();

        return;
      }

      openMenu();
    };

    const handleKeydown = function handleKeydown(event) {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    toggleButton.addEventListener('click', toggleMenu);
    document.addEventListener('keydown', handleKeydown);

    navLinks.forEach(function closeOnNavigate(link) {
      link.addEventListener('click', closeMenu);
    });
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

  const initSmoothScroll = function initSmoothScroll() {
    const links = Utils.getElements('a[href^="#"]');

    if (links.length === 0) {
      return;
    }

    const handleClick = function handleClick(event) {
      const targetId = event.currentTarget.getAttribute('href');

      if (targetId === '#') {
        return;
      }

      event.preventDefault();

      const target = Utils.getElement(targetId);

      if (!target) {
        return;
      }

      Utils.smoothScroll(target, SMOOTH_SCROLL_OFFSET);
    };

    links.forEach(function bindLink(link) {
      link.addEventListener('click', handleClick);
    });
  };

  const initScrollAnimations = function initScrollAnimations() {
    const animateElements = Utils.getElements('[data-animate]');

    if (animateElements.length === 0) {
      return;
    }

    const observerCallback = function observerCallback(entries, observer) {
      entries.forEach(function revealEntry(entry) {
        if (!entry.isIntersecting) {
          return;
        }

        Utils.addClass(entry.target, 'is-visible');
        observer.unobserve(entry.target);
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: REVEAL_ROOT_MARGIN,
      threshold: REVEAL_THRESHOLD,
    });

    animateElements.forEach(function observeElement(element) {
      observer.observe(element);
    });
  };

  const trackCtaClick = function trackCtaClick(event) {
    const buttonText = event.currentTarget.textContent.trim();

    pubSub.publish('cta:clicked', {
      button: buttonText,
      page: PAGE_NAME,
    });
  };

  const initCtaTracking = function initCtaTracking() {
    const ctaButtons = Utils.getElements('.btn--primary');

    ctaButtons.forEach(function bindCta(button) {
      button.addEventListener('click', trackCtaClick);
    });
  };

  const initCarousels = function initCarousels() {
    carouselInstances = mountCarousels();
  };

  const initHeroFloat = function initHeroFloat() {
    const heroMedia = Utils.getElement('.hero__media');

    if (!heroMedia || prefersReducedMotion()) {
      return;
    }

    gsap.to(heroMedia, {
      duration: HERO_FLOAT_DURATION,
      ease: EASE_SMOOTH,
      repeat: -1,
      y: HERO_FLOAT_DISTANCE,
      yoyo: true,
    });
  };

  const initHeroCrossfade = function initHeroCrossfade() {
    const primary = Utils.getElement('.hero__image--primary');
    const alternate = Utils.getElement('.hero__image--alternate');

    if (!primary || !alternate || prefersReducedMotion()) {
      return;
    }

    const timeline = gsap.timeline({ repeat: -1 });

    timeline
      .to(alternate, { duration: HERO_CROSSFADE_DURATION, ease: EASE_SOFT, opacity: 1 }, HERO_CROSSFADE_HOLD)
      .to(primary, { duration: HERO_CROSSFADE_DURATION, ease: EASE_SOFT, opacity: 0 }, HERO_CROSSFADE_HOLD)
      .to(alternate, { duration: HERO_CROSSFADE_DURATION, ease: EASE_SOFT, opacity: 0 }, `+=${HERO_CROSSFADE_HOLD}`)
      .to(primary, { duration: HERO_CROSSFADE_DURATION, ease: EASE_SOFT, opacity: 1 }, '<');
  };

  const init = function init() {
    if (isInitialized) {
      return;
    }

    I18n.init();
    initPageTransition();
    initMobileMenu();
    initLanguageToggle();
    initSmoothScroll();
    initScrollAnimations();
    initCtaTracking();
    initCarousels();
    initHeroFloat();
    initHeroCrossfade();
    glassEdgesCleanup = mountGlassEdges();

    pubSub.publish('landing:initialized', { locale: I18n.getCurrentLocale() });

    isInitialized = true;
  };

  const destroy = function destroy() {
    if (!isInitialized) {
      return;
    }

    carouselInstances.forEach(function destroyCarousel(carousel) {
      carousel.destroy();
    });
    carouselInstances = [];

    if (glassEdgesCleanup) {
      glassEdgesCleanup();
      glassEdgesCleanup = null;
    }

    isInitialized = false;
  };

  return Object.freeze({ init, destroy });
};

const homePage = createHomePage();

document.addEventListener('DOMContentLoaded', function startHome() {
  homePage.init();
});

export { createHomePage };
export default homePage;
