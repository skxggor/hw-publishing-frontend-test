import { describe, it, expect, afterEach } from 'vitest';
import { mountGlassEdges } from '@features/layout/glass-edges.js';

describe('GlassEdges', function () {
  let cleanup;

  afterEach(function () {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }

    document.body.innerHTML = '';
  });

  it('mounts a top and a bottom edge with eight layers each', function () {
    cleanup = mountGlassEdges();

    const top = document.querySelector('.glass-edge--top');
    const bottom = document.querySelector('.glass-edge--bottom');

    expect(top).not.toBeNull();
    expect(bottom).not.toBeNull();
    expect(top.querySelectorAll('.glass-edge__layer').length).toBe(8);
    expect(bottom.querySelectorAll('.glass-edge__layer').length).toBe(8);
  });

  it('sets progressive blur custom properties per layer', function () {
    cleanup = mountGlassEdges();

    const layers = document.querySelectorAll('.glass-edge--top .glass-edge__layer');

    expect(layers[0].style.getPropertyValue('--glass-blur')).toBe('0.09375px');
    expect(layers[7].style.getPropertyValue('--glass-blur')).toBe('12px');
  });

  it('sets a band mask gradient per layer', function () {
    cleanup = mountGlassEdges();

    const topMask = document.querySelector('.glass-edge--top .glass-edge__layer').style.getPropertyValue('--glass-mask');
    const bottomMask = document.querySelector('.glass-edge--bottom .glass-edge__layer').style.getPropertyValue('--glass-mask');

    expect(topMask).toContain('linear-gradient(to top');
    expect(bottomMask).toContain('linear-gradient(to bottom');
  });

  it('removes the mounted edges on cleanup', function () {
    cleanup = mountGlassEdges();

    expect(document.querySelectorAll('.glass-edge').length).toBe(2);

    cleanup();
    cleanup = null;

    expect(document.querySelectorAll('.glass-edge').length).toBe(0);
  });

  it('appends to a custom scope when provided', function () {
    const scope = document.createElement('div');

    document.body.appendChild(scope);
    cleanup = mountGlassEdges(scope);

    expect(scope.querySelectorAll('.glass-edge').length).toBe(2);
  });
});
