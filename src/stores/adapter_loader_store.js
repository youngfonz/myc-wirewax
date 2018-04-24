'use strict';

import EventEmitter from 'events';

import util from '../util.js';

const CHANGE_EVENT = "change";
const ADAPTER_JS_URL = "/static/js/webrtc/adapter.min.js";
const event_emitter = new EventEmitter();

let _adapter_js_ready = false;
let _included_adapter_js = false;
let _is_using_plugin_for_webrtc = false;
let _retrieving_video = false;

function _adapterLoaded(isUsingPlugin) {
  _is_using_plugin_for_webrtc = isUsingPlugin;
  _adapter_js_ready = true;
  event_emitter.emit(CHANGE_EVENT, 'ready');
}

function addChangeListener(callback) {
  event_emitter.on(CHANGE_EVENT, callback);
}
function removeChangeListener(callback) {
  event_emitter.removeListener(CHANGE_EVENT, callback);
}

function isAdapterReady() {
  return _adapter_js_ready;
}
function isUsingPlugin() {
  return _is_using_plugin_for_webrtc;
}
function includeAdapterJS() {
  window.AdapterJS = window.AdapterJS || {};
  if(!window.AdapterJS.webRTCReady) {
    window.AdapterJS.onwebrtcready = _adapterLoaded;
  } else {
    window.AdapterJS.webRTCReady(_adapterLoaded);
  }

  if(!_included_adapter_js) {
    _included_adapter_js = true;
    const script = document.createElement("script");
    script.src = ADAPTER_JS_URL;
    document.body.appendChild(script);
  }
}

export default {
  addChangeListener,
  removeChangeListener,
  isAdapterReady,
  isUsingPlugin,
  includeAdapterJS,
};
