import { EventEmitter } from 'events';

// Use a global variable to ensure a single shared emitter across reloads
const emitter = global.deliberateEventsEmitter || new EventEmitter();
if (!global.deliberateEventsEmitter) {
  global.deliberateEventsEmitter = emitter;
}

export default emitter;
