'use strict';

import EventEmitter from 'events';

const g_eventEmitter = new EventEmitter();

const once = g_eventEmitter.once.bind(g_eventEmitter);
const on = g_eventEmitter.on.bind(g_eventEmitter);
const removeListener = g_eventEmitter.removeListener.bind(g_eventEmitter);
const emit = g_eventEmitter.emit.bind(g_eventEmitter);

export default {
  eventEmitter: g_eventEmitter,
  once,
  on,
  removeListener,
  emit,
};
