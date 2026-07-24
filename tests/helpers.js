const createGsapMock = function createGsapMock() {
  const chainable = {
    fromTo: function fromTo() {
      return chainable;
    },
    to: function to() {
      return chainable;
    },
    from: function from() {
      return chainable;
    },
  };

  const gsapMock = function gsapMock() {
    return chainable;
  };

  gsapMock.fromTo = chainable.fromTo;
  gsapMock.to = chainable.to;
  gsapMock.from = chainable.from;
  gsapMock.timeline = function timeline() {
    return chainable;
  };

  return gsapMock;
};

const createIntersectionObserverMock = function createIntersectionObserverMock() {
  return function IntersectionObserverMock(callback) {
    return {
      observe: function observe(target) {
        callback([{ isIntersecting: true, target: target }], this);
      },
      unobserve: function unobserve() {},
      disconnect: function disconnect() {},
    };
  };
};

const installGsap = function installGsap() {
  window.gsap = createGsapMock();
};

const installIntersectionObserver = function installIntersectionObserver() {
  global.IntersectionObserver = createIntersectionObserverMock();
};

export { createGsapMock, createIntersectionObserverMock, installGsap, installIntersectionObserver };
