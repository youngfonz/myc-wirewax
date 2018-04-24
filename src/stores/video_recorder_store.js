'use strict';

import util from '../util.js';
import _ from 'lodash';
import EventEmitter from 'events';

import LocalStreamStore from './local_stream_store.js';

const CHANGE_EVENT = "change";

const TIMESLICE_SIZE_IN_MS = 10;
const MEDIA_RECORDER = window.MediaRecorder;
const LOCAL_MEDIA_CONF = {audio: true, video: true};

const event_emitter = new EventEmitter();

let _media_recorder;
let _recorded_blobs = [];
let _stream_attached = false;

function _getRecordingMimeType() {
  let options = {
    audioBitsPerSecond : 128000,
    videoBitsPerSecond : 2500000,
    mimeType : 'video/mp4'
  };

  if (!MEDIA_RECORDER.isTypeSupported(options.mimeType)) {
    options = {mimeType: 'video/mp4'};
    if (!MEDIA_RECORDER.isTypeSupported(options.mimeType)) {
      options = {mimeType: 'video/webm'};
      if (!MEDIA_RECORDER.isTypeSupported(options.mimeType)) {
        options = {mimeType: ''};
      }
    }
  }

  return options;
}
function _handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    _recorded_blobs.push(event.data);
  }
}

function addChangeListener(callback) {
  event_emitter.on(CHANGE_EVENT, callback);
}
function removeChangeListener(callback) {
  event_emitter.removeListener(CHANGE_EVENT, callback);
}

function attachStream(element) {
  attachMediaStream(element, LocalStreamStore.getLocalStream());
  _stream_attached = true;
}
function getCurrentAsBlob() {
  return new Blob(_recorded_blobs, {type: 'video/webm'});
}
function getCurrentAsVideoURL() {
  const superBuffer = getCurrentAsBlob();
  return window.URL.createObjectURL(superBuffer);
}
function getStreamAttached() {
  return _stream_attached;
}
function isSupported() {
  return MEDIA_RECORDER !== undefined;
}
function resetRecording() {
  _recorded_blobs.length = 0;
}
function startLocalStream() {
  LocalStreamStore.startLocalStream(
    LOCAL_MEDIA_CONF,
    () => { event_emitter.emit(CHANGE_EVENT, 'updated'); }
  );
}
function startRecording() {
  let have_local_stream = false;
  const local_stream = LocalStreamStore.getLocalStream();

  if(local_stream) {
    have_local_stream = true;
    const options = _getRecordingMimeType();
    try {
      _media_recorder = new MEDIA_RECORDER(local_stream, options);
    } catch (e) {
      alert("An unexpected error has occured. Please refresh.");
      util.errorLog('Exception while creating MediaRecorder: ' + e + '. mimeType: ' + options.mimeType);
    }

    if(_media_recorder) {
      _media_recorder.ondataavailable = _handleDataAvailable;
      _media_recorder.start(TIMESLICE_SIZE_IN_MS);
    }
  }

  return have_local_stream;
}
function stopLocalStream() {
  _stream_attached = false;
  LocalStreamStore.stopLocalStream();
}
function stopRecording() {
  _media_recorder.stop();
}

export default {
  addChangeListener,
  removeChangeListener,
  attachStream,
  getCurrentAsBlob,
  getCurrentAsVideoURL,
  getStreamAttached,
  isSupported,
  resetRecording,
  startLocalStream,
  startRecording,
  stopLocalStream,
  stopRecording,
};
