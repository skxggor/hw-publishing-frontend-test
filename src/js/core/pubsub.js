const createPubSub = function createPubSub() {
  const events = Object.create(null);

  const removeCallback = function removeCallback(eventName, callback) {
    const eventCallbacks = events[eventName];

    if (!eventCallbacks) {
      return;
    }

    const index = eventCallbacks.indexOf(callback);

    if (index === -1) {
      return;
    }

    eventCallbacks.splice(index, 1);
  };

  const subscribe = function subscribe(eventName, callback) {
    if (!eventName) {
      return undefined;
    }

    if (!callback || typeof callback !== 'function') {
      return undefined;
    }

    if (!events[eventName]) {
      events[eventName] = [];
    }

    events[eventName].push(callback);

    return function unsubscribe() {
      removeCallback(eventName, callback);
    };
  };

  const publish = function publish(eventName, data) {
    if (!eventName) {
      return;
    }

    const eventCallbacks = events[eventName];

    if (!eventCallbacks || eventCallbacks.length === 0) {
      return;
    }

    eventCallbacks.forEach(function invokeCallback(callback) {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event "${eventName}":`, error);
      }
    });
  };

  const clear = function clear(eventName) {
    if (!eventName) {
      Object.keys(events).forEach(function clearEvent(key) {
        events[key] = [];
      });

      return;
    }

    events[eventName] = [];
  };

  const hasSubscribers = function hasSubscribers(eventName) {
    if (!eventName) {
      return false;
    }

    const eventCallbacks = events[eventName];

    return !!(eventCallbacks && eventCallbacks.length > 0);
  };

  const getEventCount = function getEventCount(eventName) {
    if (!eventName) {
      return 0;
    }

    const eventCallbacks = events[eventName];

    return eventCallbacks ? eventCallbacks.length : 0;
  };

  return Object.freeze({
    subscribe,
    publish,
    clear,
    hasSubscribers,
    getEventCount,
  });
};

const pubSub = createPubSub();

export { createPubSub, pubSub };
