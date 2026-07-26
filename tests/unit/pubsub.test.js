import { describe, it, expect, beforeEach, vi } from 'vitest';
import { pubSub, createPubSub } from '@core/pubsub.js';

describe('PubSub - Publish-Subscribe Pattern', function () {
  let testPubSub;

  beforeEach(function () {
    testPubSub = createPubSub();
  });

  describe('subscribe', function () {
    it('should subscribe to event and return unsubscribe function', function () {
      const callback = vi.fn();
      const unsubscribe = testPubSub.subscribe('test-event', callback);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should not subscribe if event name is missing', function () {
      const callback = vi.fn();
      const unsubscribe = testPubSub.subscribe('', callback);
      const unsubscribe2 = testPubSub.subscribe(null, callback);

      expect(unsubscribe).toBe(undefined);
      expect(unsubscribe2).toBe(undefined);
    });

    it('should not subscribe if callback is missing', function () {
      const unsubscribe1 = testPubSub.subscribe('test-event', null);
      const unsubscribe2 = testPubSub.subscribe('test-event', undefined);
      const unsubscribe3 = testPubSub.subscribe('test-event', 'not-a-function');

      expect(unsubscribe1).toBe(undefined);
      expect(unsubscribe2).toBe(undefined);
      expect(unsubscribe3).toBe(undefined);
    });

    it('should call callback when event is published', function () {
      const callback = vi.fn();
      testPubSub.subscribe('test-event', callback);

      testPubSub.publish('test-event', { data: 'test' });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should support multiple subscribers for same event', function () {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      testPubSub.subscribe('test-event', callback1);
      testPubSub.subscribe('test-event', callback2);
      testPubSub.subscribe('test-event', callback3);

      testPubSub.publish('test-event', { value: 42 });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);
    });

    it('should not call callback after unsubscribe', function () {
      const callback = vi.fn();
      const unsubscribe = testPubSub.subscribe('test-event', callback);

      testPubSub.publish('test-event', { first: true });
      unsubscribe();
      testPubSub.publish('test-event', { second: true });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ first: true });
    });
  });

  describe('publish', function () {
    it('should not throw if event name is missing', function () {
      expect(function () {
        testPubSub.publish('');
      }).not.toThrow();

      expect(function () {
        testPubSub.publish(null);
      }).not.toThrow();
    });

    it('should not call subscribers for non-existent event', function () {
      const callback = vi.fn();
      testPubSub.subscribe('different-event', callback);

      testPubSub.publish('non-existent-event', { data: 'test' });

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle errors in callbacks gracefully', function () {
      const errorCallback = vi.fn(function () {
        throw new Error('Test error');
      });
      const normalCallback = vi.fn();

      testPubSub.subscribe('test-event', errorCallback);
      testPubSub.subscribe('test-event', normalCallback);

      expect(function () {
        testPubSub.publish('test-event', { data: 'test' });
      }).not.toThrow();

      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
    });

    it('should pass data to all subscribers', function () {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const testData = { message: 'test data', value: 123 };

      testPubSub.subscribe('test-event', callback1);
      testPubSub.subscribe('test-event', callback2);

      testPubSub.publish('test-event', testData);

      expect(callback1).toHaveBeenCalledWith(testData);
      expect(callback2).toHaveBeenCalledWith(testData);
    });
  });

  describe('clear', function () {
    it('should clear all events when no event name provided', function () {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      testPubSub.subscribe('event1', callback1);
      testPubSub.subscribe('event2', callback2);

      testPubSub.clear();

      testPubSub.publish('event1', {});
      testPubSub.publish('event2', {});

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });

    it('should clear specific event when event name provided', function () {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      testPubSub.subscribe('event1', callback1);
      testPubSub.subscribe('event2', callback2);

      testPubSub.clear('event1');

      testPubSub.publish('event1', {});
      testPubSub.publish('event2', {});

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });

  describe('hasSubscribers', function () {
    it('should return false when no subscribers', function () {
      expect(testPubSub.hasSubscribers('test-event')).toBe(false);
    });

    it('should return false when event name is missing', function () {
      testPubSub.subscribe('test-event', vi.fn());
      expect(testPubSub.hasSubscribers('')).toBe(false);
      expect(testPubSub.hasSubscribers(null)).toBe(false);
    });

    it('should return true when event has subscribers', function () {
      testPubSub.subscribe('test-event', vi.fn());
      expect(testPubSub.hasSubscribers('test-event')).toBe(true);
    });

    it('should return false after unsubscribing all', function () {
      const unsubscribe = testPubSub.subscribe('test-event', vi.fn());
      expect(testPubSub.hasSubscribers('test-event')).toBe(true);

      unsubscribe();
      expect(testPubSub.hasSubscribers('test-event')).toBe(false);
    });
  });

  describe('getEventCount', function () {
    it('should return 0 when no subscribers', function () {
      expect(testPubSub.getEventCount('test-event')).toBe(0);
    });

    it('should return 0 when event name is missing', function () {
      expect(testPubSub.getEventCount('')).toBe(0);
      expect(testPubSub.getEventCount(null)).toBe(0);
    });

    it('should return correct subscriber count', function () {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      testPubSub.subscribe('test-event', callback1);
      expect(testPubSub.getEventCount('test-event')).toBe(1);

      testPubSub.subscribe('test-event', callback2);
      testPubSub.subscribe('test-event', callback3);
      expect(testPubSub.getEventCount('test-event')).toBe(3);
    });

    it('should decrease count when unsubscribing', function () {
      const unsubscribe = testPubSub.subscribe('test-event', vi.fn());
      expect(testPubSub.getEventCount('test-event')).toBe(1);

      unsubscribe();
      expect(testPubSub.getEventCount('test-event')).toBe(0);
    });
  });

  describe('frozen API', function () {
    it('should return frozen object with immutable API', function () {
      expect(Object.isFrozen(testPubSub)).toBe(true);
    });

    it('should have required methods', function () {
      expect(typeof testPubSub.subscribe).toBe('function');
      expect(typeof testPubSub.publish).toBe('function');
      expect(typeof testPubSub.clear).toBe('function');
      expect(typeof testPubSub.hasSubscribers).toBe('function');
      expect(typeof testPubSub.getEventCount).toBe('function');
    });

    it('should not allow adding new properties', function () {
      expect(function () {
        testPubSub.newMethod = function () {};
      }).toThrow();
    });
  });
});

describe('Global pubSub instance', function () {
  it('should export global pubSub instance', function () {
    expect(pubSub).toBeDefined();
    expect(typeof pubSub.subscribe).toBe('function');
    expect(typeof pubSub.publish).toBe('function');
  });

  it('should work independently from other instances', function () {
    const localPubSub = createPubSub();
    const globalCallback = vi.fn();
    const localCallback = vi.fn();

    pubSub.subscribe('test-event', globalCallback);
    localPubSub.subscribe('test-event', localCallback);

    pubSub.publish('test-event', { data: 'test' });

    expect(globalCallback).toHaveBeenCalledTimes(1);
    expect(localCallback).not.toHaveBeenCalled();
  });
});
