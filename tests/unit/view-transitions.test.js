import { describe, it, expect, vi } from 'vitest';
import {
  isAbortError,
  handleReadyRejection,
  silenceExpectedSkip,
  handleViewTransitionEvent,
  registerViewTransitionHandlers,
} from '@core/view-transitions.js';

describe('View Transitions guard', function () {
  describe('isAbortError', function () {
    it('should return true for an AbortError', function () {
      const error = new Error('Transition was skipped');

      error.name = 'AbortError';

      expect(isAbortError(error)).toBe(true);
    });

    it('should return false for other errors', function () {
      const error = new Error('Something else');

      error.name = 'TypeError';

      expect(isAbortError(error)).toBe(false);
    });

    it('should return false for null or undefined', function () {
      expect(isAbortError(null)).toBe(false);
      expect(isAbortError(undefined)).toBe(false);
    });
  });

  describe('handleReadyRejection', function () {
    it('should swallow AbortError without throwing', function () {
      const error = new Error('Transition was skipped');

      error.name = 'AbortError';

      expect(function safeHandle() {
        handleReadyRejection(error);
      }).not.toThrow();
    });

    it('should rethrow non-Abort errors', function () {
      const error = new Error('Genuine failure');

      expect(function unsafeHandle() {
        handleReadyRejection(error);
      }).toThrow('Genuine failure');
    });
  });

  describe('silenceExpectedSkip', function () {
    it('should do nothing when viewTransition is missing', function () {
      expect(function noTransition() {
        silenceExpectedSkip(undefined);
        silenceExpectedSkip(null);
      }).not.toThrow();
    });

    it('should attach a rejection handler to viewTransition.ready', function () {
      const catchSpy = vi.fn();
      const viewTransition = { ready: { catch: catchSpy } };

      silenceExpectedSkip(viewTransition);

      expect(catchSpy).toHaveBeenCalledTimes(1);
      expect(catchSpy).toHaveBeenCalledWith(handleReadyRejection);
    });
  });

  describe('handleViewTransitionEvent', function () {
    it('should silence the transition exposed by the event', function () {
      const catchSpy = vi.fn();

      handleViewTransitionEvent({ viewTransition: { ready: { catch: catchSpy } } });

      expect(catchSpy).toHaveBeenCalledTimes(1);
    });

    it('should be safe when the event has no viewTransition', function () {
      expect(function noTransition() {
        handleViewTransitionEvent({});
      }).not.toThrow();
    });
  });

  describe('registerViewTransitionHandlers', function () {
    it('should register pageswap and pagereveal listeners', function () {
      const addEventListener = vi.fn();
      const target = { addEventListener: addEventListener };

      registerViewTransitionHandlers(target);

      const eventNames = addEventListener.mock.calls.map(function extractName(call) {
        return call[0];
      });

      expect(eventNames).toContain('pageswap');
      expect(eventNames).toContain('pagereveal');
      expect(addEventListener).toHaveBeenCalledTimes(2);
    });
  });
});
