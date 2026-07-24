/**
 * Cross-document View Transitions guard.
 *
 * When the outgoing document is hidden during navigation, the browser skips
 * its ViewTransition and `viewTransition.ready` rejects with AbortError.
 * That surfaces as an uncaught promise rejection. This module silences the
 * expected AbortError while still surfacing genuine errors.
 *
 * https://developer.chrome.com/docs/web-platform/view-transitions/cross-document
 */

const isAbortError = function isAbortError(error) {
  return Boolean(error && error.name === 'AbortError');
};

const handleReadyRejection = function handleReadyRejection(error) {
  if (isAbortError(error)) {
    return;
  }

  throw error;
};

const silenceExpectedSkip = function silenceExpectedSkip(viewTransition) {
  if (!viewTransition) {
    return;
  }

  viewTransition.ready.catch(handleReadyRejection);
};

const handleViewTransitionEvent = function handleViewTransitionEvent(event) {
  silenceExpectedSkip(event.viewTransition);
};

const registerViewTransitionHandlers = function registerViewTransitionHandlers(target) {
  const eventTarget = target || window;

  eventTarget.addEventListener('pageswap', handleViewTransitionEvent);
  eventTarget.addEventListener('pagereveal', handleViewTransitionEvent);
};

if (typeof window !== 'undefined') {
  registerViewTransitionHandlers(window);
}

export {
  isAbortError,
  handleReadyRejection,
  silenceExpectedSkip,
  handleViewTransitionEvent,
  registerViewTransitionHandlers,
};
