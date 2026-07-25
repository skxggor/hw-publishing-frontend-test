import { gsap } from 'gsap';

const SELECTOR = '.page-transition';
const LETTER_SELECTOR = '.page-transition__letter';
const AMPERSAND_SELECTOR = '.page-transition__ampersand';
const TAGLINE_SELECTOR = '.page-transition__tagline';

function getOverlay() {
  return document.querySelector(SELECTOR);
}

function animateIn(overlay) {
  const letters = overlay.querySelectorAll(LETTER_SELECTOR);
  const ampersand = overlay.querySelector(AMPERSAND_SELECTOR);
  const tagline = overlay.querySelector(TAGLINE_SELECTOR);

  const tl = gsap.timeline();

  tl.set([...letters, ampersand, tagline], {
    opacity: 0,
    y: 40,
  });

  tl.to(letters[0], {
    duration: 0.4,
    ease: 'power3.out',
    opacity: 1,
    y: 0,
  });

  tl.to(ampersand, {
    duration: 0.4,
    ease: 'power3.out',
    opacity: 1,
    y: 0,
  }, '-=0.25');

  tl.to(letters[1], {
    duration: 0.4,
    ease: 'power3.out',
    opacity: 1,
    y: 0,
  }, '-=0.25');

  tl.to(tagline, {
    duration: 0.5,
    ease: 'power3.out',
    opacity: 1,
    y: 0,
  }, '-=0.15');

  tl.to([letters[0], ampersand, letters[1]], {
    duration: 0.8,
    ease: 'power2.inOut',
    backgroundPosition: '200% 0',
    stagger: 0.05,
  }, '-=0.3');

  return tl;
}

function animateOut(overlay) {
  const letters = overlay.querySelectorAll(LETTER_SELECTOR);
  const ampersand = overlay.querySelector(AMPERSAND_SELECTOR);
  const tagline = overlay.querySelector(TAGLINE_SELECTOR);

  const tl = gsap.timeline({
    onComplete() {
      overlay.setAttribute('data-state', 'closed');
      document.body.setAttribute('data-loaded', 'true');
      document.body.removeAttribute('data-scroll-locked');
    },
  });

  tl.to(tagline, {
    duration: 0.3,
    ease: 'power3.in',
    opacity: 0,
    y: -20,
  });

  tl.to([letters[0], ampersand, letters[1]], {
    duration: 0.3,
    ease: 'power3.in',
    opacity: 0,
    y: -40,
    stagger: 0.05,
  }, '-=0.1');

  return tl;
}

function shouldSkipTransition() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initPageTransition() {
  const overlay = getOverlay();

  if (!overlay) return;

  if (shouldSkipTransition()) {
    overlay.setAttribute('data-state', 'closed');

    return;
  }

  document.body.setAttribute('data-scroll-locked', 'true');

  const entrance = animateIn(overlay);

  entrance.eventCallback('onComplete', () => {
    setTimeout(() => {
      animateOut(overlay);
    }, 600);
  });

  document.addEventListener('click', function handleLinkClick(event) {
    const link = event.target.closest('a[href]');

    if (!link) return;

    const href = link.getAttribute('href');

    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    if (link.origin !== window.location.origin) return;

    if (link.target === '_blank') return;

    event.preventDefault();

    document.body.setAttribute('data-scroll-locked', 'true');

    const exit = animateOut(overlay);

    exit.eventCallback('onComplete', () => {
      window.location.href = href;
    });

    document.removeEventListener('click', handleLinkClick);
  });
}
