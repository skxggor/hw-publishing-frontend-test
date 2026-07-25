/**
 * Details carousel built on Embla Carousel (vanilla, no jQuery).
 * Wires up prev/next buttons, generated dots and autoplay.
 */

import EmblaCarousel from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import Utils from '@core/utils.js';

const AUTOPLAY_DELAY = 4000;
const CAROUSEL_OPTIONS = { align: 'center', loop: true };

const createCarousel = function createCarousel(rootElement) {
  if (!rootElement) {
    return null;
  }

  const viewport = rootElement.querySelector('[data-carousel-viewport]');
  const prevButton = rootElement.querySelector('[data-carousel-prev]');
  const nextButton = rootElement.querySelector('[data-carousel-next]');
  const dotsContainer = rootElement.querySelector('[data-carousel-dots]');

  if (!viewport) {
    return null;
  }

  let api = null;
  let dotButtons = [];
  let slideElements = [];

  const updateSlides = function updateSlides() {
    const selected = api.selectedScrollSnap();

    slideElements.forEach(function toggleSlide(slide, index) {
      if (index === selected) {
        Utils.addClass(slide, 'is-selected');

        return;
      }

      Utils.removeClass(slide, 'is-selected');
    });
  };

  const updateDots = function updateDots() {
    const selected = api.selectedScrollSnap();

    dotButtons.forEach(function toggleDot(dot, index) {
      if (index === selected) {
        Utils.addClass(dot, 'is-active');

        return;
      }

      Utils.removeClass(dot, 'is-active');
    });
  };

  const scrollToIndex = function scrollToIndex(index) {
    api.scrollTo(index);
  };

  const scrollPrev = function scrollPrev() {
    api.scrollPrev();
  };

  const scrollNext = function scrollNext() {
    api.scrollNext();
  };

  const buildSlides = function buildSlides() {
    slideElements = Array.from(viewport.querySelectorAll('.carousel__slide'));
    updateSlides();
  };

  const buildDots = function buildDots() {
    if (!dotsContainer) {
      return;
    }

    dotsContainer.innerHTML = '';

    dotButtons = api.scrollSnapList().map(function createDot(entry, index) {
      const dot = document.createElement('button');

      dot.type = 'button';
      Utils.addClass(dot, 'carousel__dot');
      dot.setAttribute('aria-label', `Ir para o slide ${index + 1}`);
      dot.addEventListener('click', function handleDotClick() {
        scrollToIndex(index);
      });
      dotsContainer.appendChild(dot);

      return dot;
    });

    updateDots();
  };

  const bindEvents = function bindEvents() {
    if (prevButton) {
      prevButton.addEventListener('click', scrollPrev);
    }

    if (nextButton) {
      nextButton.addEventListener('click', scrollNext);
    }

    if (api) {
      api.on('select', updateSlides);
      api.on('select', updateDots);
      api.on('init', updateSlides);
      api.on('init', updateDots);
    }
  };

  const unbindEvents = function unbindEvents() {
    if (prevButton) {
      prevButton.removeEventListener('click', scrollPrev);
    }

    if (nextButton) {
      nextButton.removeEventListener('click', scrollNext);
    }

    if (api) {
      api.off('select', updateSlides);
      api.off('select', updateDots);
      api.off('init', updateSlides);
      api.off('init', updateDots);
    }
  };

  const init = function init() {
    if (api) {
      return;
    }

    const autoplay = Autoplay({ delay: AUTOPLAY_DELAY, stopOnInteraction: false });

    api = EmblaCarousel(viewport, CAROUSEL_OPTIONS, [autoplay]);
    buildSlides();
    buildDots();
    bindEvents();
  };

  const destroy = function destroy() {
    unbindEvents();

    if (api) {
      api.destroy();
      api = null;
    }

    if (dotsContainer) {
      dotsContainer.innerHTML = '';
    }

    dotButtons = [];
    slideElements = [];
  };

  return Object.freeze({ init, destroy });
};

const mountCarousels = function mountCarousels() {
  const carousels = Utils.getElements('[data-carousel]');

  return carousels
    .map(function mount(root) {
      const carousel = createCarousel(root);

      if (carousel) {
        carousel.init();
      }

      return carousel;
    })
    .filter(Boolean);
};

export { createCarousel, mountCarousels };
export default mountCarousels;
