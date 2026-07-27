# AGENTS.md - Project Technical Specifications

## Project Overview
H&W Publishing frontend test case. 5-page sales funnel for a rare first-edition Demian by Hermann Hesse.

---

## Architecture

### Core Principles
- Pub/Sub pattern for decoupling
- Pure functions only (no anonymous functions)
- Early return always
- Event-driven architecture
- TDD workflow (RED, GREEN, REFACTOR) with Vitest
- Mobile-first CSS
- No inline styles
- Path aliases for all imports (never relative `../`)

### Allowed Libraries
- GSAP for animations
- Embla Carousel (vanilla) for carousel
- Rsbuild (layer over Rspack) for build/bundle
- Vitest + Testing Library for tests

### Path Aliases (defined in jsconfig.json, rsbuild.config.js, vitest.config.js)

| Alias | Path |
|---|---|
| @core | src/js/core |
| @features | src/js/features |
| @pages | src/js/pages |
| @locales | src/locales |
| @css | src/css |

---

## CSS Rules

- Pure CSS, no preprocessors
- CSS custom properties for theming
- Mobile-first with `@media (min-width:)` breakpoints
- Properties in alphabetical order within rules
- Google Fonts loaded via `<link>` in HTML with `preconnect`, never via `@import url()` in CSS
- `is-hidden` class for visibility toggling, no `element.style.*`
- `src/css/styles.css` is the single entry point importing all base layers and components
- Cross-document View Transitions in `src/css/base/transitions.css`, progressive enhancement only
- Transitions within a page (reveals, confetti) use GSAP, separate from View Transitions

---

## i18n

- Two locales: pt-BR (default) and en-US
- JSON files imported as ES modules
- Browser locale detection with localStorage override
- Copyright strings use `{year}` placeholder

---

## Project Structure

pages/
  index.html
  upsell.html
  thank-you.html
  terms.html
  privacy.html
src/
  css/
    base/ (fonts.css, reset.css, transitions.css, typography.css, utilities.css, variables.css)
    components/ (buttons.css, carousel.css, footer.css, glass-edges.css, guarantee.css, header.css, hero.css, layout.css, legal.css, loader.css, price.css, testimonials.css, thank-you.css, upsell.css)
    styles.css
  js/
    core/ (i18n.js, pubsub.js, utils.js, view-transitions.js)
    features/
      landing/ (carousel.js)
      layout/ (glass-edges.js, language-toggle.js)
    pages/ (index.js, upsell.js, thank-you.js, terms.js, privacy.js)
  locales/ (en-US.json, pt-BR.json)
tests/
  unit/ (carousel.test.js, glass-edges.test.js, i18n.test.js, pubsub.test.js, utils-extras.test.js, utils.test.js, view-transitions.test.js)
  integration/ (index.test.js, thank-you.test.js, upsell.test.js)
  helpers.js, setup.js

---

## Build & Scripts (Rsbuild)

| Script | Description |
|---|---|
| npm run dev | Development server (port 3000) |
| npm run build | Production build |
| npm run preview | Preview build output |
| npm test | Vitest watch mode |
| npm run test:run | Vitest single run |
| npm run test:coverage | Vitest with coverage |
| npm run lint | ESLint on src/js/ |
| npm run lint:css | Stylelint on src/css/ |
| npm run format | Prettier write |
| npm run format:check | Prettier check |
| npm run check | lint + lint:css + format:check |

### Deploy
Vercel recommended. Target Lighthouse scores >90.

---

## Product Details

- Product: First Portuguese edition of Demian (Hermann Hesse), collector's item
- Landing page: highlights edition quality, Nobel Prize 1946, authenticity, sealed condition
- Upsell page: companion book Offer (Steppenwolf), revealed after video, 10s countdown
- Thank You page: order confirmation with summary (book + companion), next steps

---

## i18n Key Structure

```json
{
  "common": { "currency": "R$", "error": "...", "loading": "..." },
  "header": { "logo", "book", "buyNow", "home", "language", ... },
  "footer": { "copyright", "tagline", "terms", "privacy", "contact", "social" },
  "landing": { "hero", "details", "guarantee", "testimonials", "cta" },
  "upsell": { "hero", "offer", "guarantee", "info", "cta" },
  "thankYou": { "hero", "orderSummary", "nextSteps", "support" },
  "legal": { "privacy", "terms" }
}
```

---

## Code Style

```javascript
// Pure function, named, early return
function handleClick(event) {
  if (!event) return;

  const target = getTarget(event);

  if (!target) return;

  process(target);
}
```

No anonymous functions in callbacks. No `../` imports. Blank line after variable declarations.