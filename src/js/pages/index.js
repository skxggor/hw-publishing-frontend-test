import '@css/styles.css';

import { pubSub } from '@core/pubsub.js';
import Utils from '@core/utils.js';
import I18n from '@core/i18n.js';

const createHomePage = function createHomePage() {
  let isInitialized = false;

  const initMobileMenu = function initMobileMenu() {
    const toggleButton = Utils.getElement('#mobileMenuToggle');
    const header = Utils.getElement('.header');

    if (!toggleButton || !header) {
      return;
    }

    const toggleMenu = function toggleMenu() {
      Utils.toggleClass(header, 'header--menu-open');
    };

    toggleButton.addEventListener('click', toggleMenu);
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

      Utils.smoothScroll(target, 80);
    };

    links.forEach(function bindLink(link) {
      link.addEventListener('click', handleClick);
    });
  };

  const initHeaderScroll = function initHeaderScroll() {
    const header = Utils.getElement('.header');

    if (!header) {
      return;
    }

    const handleScroll = Utils.throttle(function handleScroll() {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        Utils.addClass(header, 'header--scrolled');

        return;
      }

      Utils.removeClass(header, 'header--scrolled');
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
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
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    });

    animateElements.forEach(function observeElement(element) {
      observer.observe(element);
    });
  };

  const trackCtaClick = function trackCtaClick(event) {
    const buttonText = event.currentTarget.textContent.trim();

    pubSub.publish('cta:clicked', {
      button: buttonText,
      page: 'landing',
    });
  };

  const initCtaTracking = function initCtaTracking() {
    const ctaButtons = Utils.getElements('.btn--primary');

    ctaButtons.forEach(function bindCta(button) {
      button.addEventListener('click', trackCtaClick);
    });
  };

  const initTestimonialSlider = function initTestimonialSlider() {
    const testimonials = Utils.getElements('.testimonial-card');

    if (testimonials.length === 0) {
      return;
    }

    let currentIndex = 0;

    const showTestimonial = function showTestimonial(index) {
      testimonials.forEach(function toggleCard(card, cardIndex) {
        if (cardIndex === index) {
          Utils.addClass(card, 'testimonial-card--active');

          return;
        }

        Utils.removeClass(card, 'testimonial-card--active');
      });
    };

    const showNextTestimonial = function showNextTestimonial() {
      currentIndex = (currentIndex + 1) % testimonials.length;

      showTestimonial(currentIndex);
    };

    showTestimonial(0);

    return setInterval(showNextTestimonial, 5000);
  };

  const init = function init() {
    if (isInitialized) {
      return;
    }

    I18n.init();
    initMobileMenu();
    initLanguageToggle();
    initSmoothScroll();
    initHeaderScroll();
    initScrollAnimations();
    initCtaTracking();
    initTestimonialSlider();

    pubSub.publish('landing:initialized', { locale: I18n.getCurrentLocale() });

    isInitialized = true;
  };

  return Object.freeze({ init });
};

const homePage = createHomePage();

document.addEventListener('DOMContentLoaded', function startHome() {
  homePage.init();
});

export { createHomePage };
export default homePage;
