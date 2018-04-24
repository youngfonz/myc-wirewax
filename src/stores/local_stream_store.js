'use strict';

import EventEmitter from 'events';

import util from '../util.js';

const CHANGE_EVENT = "change";

const local_stream_emitter = new EventEmitter();

let _local_stream;
let _retrieving_video = false;
let _audio_state = true;
let _video_state = true;

function addChangeListener(callback) {
  local_stream_emitter.on(CHANGE_EVENT, callback);
}
function getLocalAudioState() {
  return _audio_state;
}
function getLocalVideoState() {
  return _video_state;
}
function getLocalStream() {
  return _local_stream;
}
function removeChangeListener(callback) {
  local_stream_emitter.removeListener(CHANGE_EVENT, callback);
}
function startLocalStream(media_conf, success=function() { }, failure=util.errorLog) {
  if(_retrieving_video) {
    return;
  }
  _retrieving_video = true;

  navigator.getUserMedia(
    media_conf,
    (stream) => {
      _retrieving_video = false;
      _local_stream = stream;
      success(stream);
    },
    (error) => {
      _retrieving_video = false;
      failure(error);
    });
}
function stopLocalStream() {
  if (_local_stream) {
    _.each(_local_stream.getTracks(),(track) => {
      track.stop();
    });
  }
  _local_stream = null;
}
function toggleLocalAudio() {
  let new_state;
  if(_local_stream) {
    _.each(_local_stream.getAudioTracks(), (track) => {
      new_state = !track.enabled;
      track.enabled = !track.enabled;
    });
  }
  _audio_state = new_state;
  local_stream_emitter.emit(CHANGE_EVENT, 'audio');

  return new_state;
}
function toggleLocalVideo() {
  let new_state;
  if(_local_stream) {
    _.each(_local_stream.getVideoTracks(), (track) => {
      new_state = !track.enabled;
      track.enabled = !track.enabled;
    });
  }
  _video_state = new_state;
  local_stream_emitter.emit(CHANGE_EVENT, 'video');

  return new_state;
}

export default {
  addChangeListener,
  getLocalAudioState,
  getLocalVideoState,
  getLocalStream,
  removeChangeListener,
  startLocalStream,
  stopLocalStream,
  toggleLocalAudio,
  toggleLocalVideo,
}
