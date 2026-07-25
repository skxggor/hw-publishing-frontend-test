import { describe, it, expect, beforeEach, vi } from 'vitest';
import EmblaCarousel from 'embla-carousel';
import { createCarousel, mountCarousels } from '@features/landing/carousel.js';

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

const buildCarousel = function buildCarousel() {
  const root = document.createElement('div');
  const viewport = document.createElement('div');
  const controls = document.createElement('div');
  const prev = document.createElement('button');
  const next = document.createElement('button');
  const dots = document.createElement('div');

  root.setAttribute('data-carousel', '');
  viewport.setAttribute('data-carousel-viewport', '');
  controls.classList.add('carousel__controls');
  prev.setAttribute('data-carousel-prev', '');
  next.setAttribute('data-carousel-next', '');
  dots.setAttribute('data-carousel-dots', '');
  controls.append(prev, next);
  root.append(viewport, controls, dots);
  document.body.appendChild(root);

  return root;
};

describe('Carousel', function () {
  beforeEach(function () {
    vi.clearAllMocks();
  });

  it('returns null when the root element is missing', function () {
    expect(createCarousel(null)).toBeNull();
  });

  it('returns null when the viewport is missing', function () {
    const root = document.createElement('div');

    root.setAttribute('data-carousel', '');

    expect(createCarousel(root)).toBeNull();
  });

  it('creates one dot per snap and registers embla events on init', function () {
    const root = buildCarousel();
    const carousel = createCarousel(root);

    carousel.init();

    expect(root.querySelectorAll('.carousel__dot').length).toBe(3);
    expect(emblaApi.on).toHaveBeenCalledWith('select', expect.any(Function));
    expect(emblaApi.on).toHaveBeenCalledWith('init', expect.any(Function));
  });

  it('does not run init twice', function () {
    const root = buildCarousel();
    const carousel = createCarousel(root);

    carousel.init();
    carousel.init();

    expect(EmblaCarousel).toHaveBeenCalledTimes(1);
  });

  it('navigates with prev and next buttons', function () {
    const root = buildCarousel();
    const carousel = createCarousel(root);

    carousel.init();
    root.querySelector('[data-carousel-prev]').click();
    root.querySelector('[data-carousel-next]').click();

    expect(emblaApi.scrollPrev).toHaveBeenCalledTimes(1);
    expect(emblaApi.scrollNext).toHaveBeenCalledTimes(1);
  });

  it('scrolls to a slide when a dot is clicked', function () {
    const root = buildCarousel();
    const carousel = createCarousel(root);

    carousel.init();
    root.querySelectorAll('.carousel__dot')[2].click();

    expect(emblaApi.scrollTo).toHaveBeenCalledWith(2);
  });

  it('is resilient when controls are missing', function () {
    const root = document.createElement('div');
    const viewport = document.createElement('div');

    root.setAttribute('data-carousel', '');
    viewport.setAttribute('data-carousel-viewport', '');
    root.appendChild(viewport);
    document.body.appendChild(root);

    const carousel = createCarousel(root);

    expect(function safeInit() {
      carousel.init();
    }).not.toThrow();
  });

  it('destroys the api, unbinds events and clears dots', function () {
    const root = buildCarousel();
    const carousel = createCarousel(root);

    carousel.init();
    carousel.destroy();

    expect(emblaApi.off).toHaveBeenCalled();
    expect(emblaApi.destroy).toHaveBeenCalled();
    expect(root.querySelectorAll('.carousel__dot').length).toBe(0);
  });

  it('mountCarousels initializes every carousel found in the DOM', function () {
    buildCarousel();
    buildCarousel();

    const instances = mountCarousels();

    expect(instances.length).toBe(2);
  });
});
