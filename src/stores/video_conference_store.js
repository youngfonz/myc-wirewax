'use strict';

import EventEmitter from 'events';
import _ from 'lodash';
import uuid from 'node-uuid';

import AdapterLoaderStore from './adapter_loader_store.js';
import LocalStreamStore from './local_stream_store.js';
import util from '../util.js';
import SignalService from '../signal_service.js';
import PeerStore from './peer_store.js';
import UserStore from './user_store.js';

const CHANGE_EVENT = "change";
const DEFAULT_LOCAL_MEDIA_CONF = {audio: true, video: true};
const PEER_ID = uuid.v4();
const PEER_SYN_MESSAGE = {peer_syn: {peer_id: PEER_ID}};
const READY_EVENT = 'ready';
const REMOTE_CHANGE_EVENT = 'remote_peer_change';

const event_emitter = new EventEmitter();

let _signaling_ready = false;
let _current_user = UserStore.getUser();

function _buildPeerSyn() {
  let peer_syn = JSON.parse(JSON.stringify(PEER_SYN_MESSAGE));

  peer_syn.peer_syn.user_name = _current_user.user_name || _current_user.email;
  peer_syn.peer_syn.audio = LocalStreamStore.getLocalAudioState();
  peer_syn.peer_syn.video = LocalStreamStore.getLocalVideoState();

  return peer_syn;
}
function _checkConnectivity() {
  if(_signaling_ready && AdapterLoaderStore.isAdapterReady()) {
    event_emitter.emit(READY_EVENT, 'updated');
  }
}
function _connectPeer(peer, offer, destination_peer_id) {
  if(AdapterLoaderStore.isUsingPlugin()) {
    __connectPeerCB(peer, offer, destination_peer_id);
  } else {
    __connectPeerPromise(peer, offer, destination_peer_id);
  }
}
function _detachLocal() {
  LocalStreamStore.stopLocalStream();
}
function _processConnect() {
  _signaling_ready = true;
  _checkConnectivity();
}
function _processMessage(data) {
  const peer_id = data.source_peer_id;
  const dest_peer_id = data.dest_peer_id || PEER_ID;
  const signal = JSON.parse(data.message);

  if(dest_peer_id == PEER_ID) {
    if(!PeerStore.getPeerByID(peer_id)) {
      const signaler_proxy = {
        sendMessage: function(message, destination_peer_id) {
          SignalService.sendMessage(message, PEER_ID, destination_peer_id);
        }
      };
      PeerStore.addPeer(peer_id, signaler_proxy, LocalStreamStore.getLocalStream());
    }

    const peer_rtc_conn = PeerStore.getPeerRTCConnection(peer_id);

    // New peer has made themselves known
    if(signal.peer_syn) {
      PeerStore.addPeerName(peer_id, signal.peer_syn.user_name);
      PeerStore.updatePeerAudio(peer_id, signal.peer_syn.audio);
      PeerStore.updatePeerVideo(peer_id, signal.peer_syn.video);
      peer_rtc_conn.createOffer(
        (description) => {
          _setLocalDescription(peer_rtc_conn, description, peer_id);
        },
        util.errorLog);
    } else if(signal.sdp) {
      if(signal.sdp.user_name) {
        PeerStore.addPeerName(peer_id, signal.sdp.user_name);
      }
      if('audio' in signal.sdp) {
        PeerStore.updatePeerAudio(peer_id, signal.sdp.audio);
      }
      if('video' in signal.sdp) {
        PeerStore.updatePeerVideo(peer_id, signal.sdp.video);
      }
      _connectPeer(peer_rtc_conn, signal.sdp, peer_id);
    } else if(signal.ice) {
      PeerStore.addIceCandidates(peer_id, signal.ice);
    } else if('audio' in signal) {
      PeerStore.updatePeerAudio(peer_id, signal.audio);
    } else if('video' in signal) {
      PeerStore.updatePeerVideo(peer_id, signal.video);
    } else {
      util.errorLog('Unknown message payload.', signal);
    }
  }
}
function _sendLocalDescription(peer, destination_peer_id) {
  const message_payload = {
    sdp: {
      type: peer.localDescription.type,
      sdp: peer.localDescription.sdp,
      user_name: _current_user.user_name || _current_user.email,
      audio: LocalStreamStore.getLocalAudioState(),
      video: LocalStreamStore.getLocalVideoState(),
  }};

  SignalService.sendMessage(JSON.stringify(message_payload),
                            PEER_ID,
                            destination_peer_id);
}
function _setLocalDescription(peer, description, destination_peer_id) {
  if(AdapterLoaderStore.isUsingPlugin()) {
    __setLocalDescriptionCB(peer, description, destination_peer_id);
  } else {
    __setLocalDescriptionPromise(peer, description, destination_peer_id);
  }
}
function _setUser(user) {
  _current_user = UserStore.getUser();
}

function __connectPeerPromise(peer, offer, destination_peer_id) {
  const promise = peer.setRemoteDescription(new RTCSessionDescription(offer));
  if(offer.type == 'offer') {
    promise
    .then(() => {
      return peer.createAnswer();
    })
    .then((description) => {
      _setLocalDescription(peer, description, destination_peer_id);
    })
    .catch(util.errorLog);
  }
}
function __connectPeerCB(peer, offer, destination_peer_id) {
  let callback = function() { };

  if(offer.type == 'offer') {
    callback = () => {
      peer.createAnswer(
        (description) => {
          _setLocalDescription(peer, description, destination_peer_id);
        },
        util.errorLog);
    };
  }

  peer.setRemoteDescription(new RTCSessionDescription(offer), callback, util.errorLog);
}
function __setLocalDescriptionPromise(peer, description, destination_peer_id) {
  peer.setLocalDescription(description)
    .then(() => {
      _sendLocalDescription(peer, destination_peer_id);
    })
    .catch(util.errorLog);
}
function __setLocalDescriptionCB(peer, description, destination_peer_id) {
  peer.setLocalDescription(
    description,
    () => {
      _sendLocalDescription(peer, destination_peer_id);
    },
    util.errorLog);
}

function addChangeListener(callback) {
  event_emitter.on(CHANGE_EVENT, callback);
}
function addReadyListener(callback) {
  event_emitter.on(READY_EVENT, callback);
}
function addRemoteChangeListener(callback) {
  event_emitter.on(REMOTE_CHANGE_EVENT, callback);
}
function attachStream(element, peerID) {
  let attached = false;
  const stream = PeerStore.getPeerStream(peerID) || LocalStreamStore.getLocalStream();
  if(stream) {
    attachMediaStream(element, stream);
    attached = true;
  }
  return attached;
}
function fetchLocal(notify_peers, media_conf=DEFAULT_LOCAL_MEDIA_CONF) {
  LocalStreamStore.startLocalStream(
    media_conf,
    (stream) => {
      event_emitter.emit(CHANGE_EVENT, 'updated');
      if(notify_peers !== false) {
        SignalService.sendMessage(JSON.stringify(_buildPeerSyn()), PEER_ID);
      }
    });
}
function getPeerAudioState(peerID) {
  return PeerStore.getPeerAudioState(peerID);
}
function getPeerName(peerID) {
  return PeerStore.getPeerName(peerID);
}
function getPeerVideoState(peerID) {
  return PeerStore.getPeerVideoState(peerID);
}
function initConference(newConfID) {
  AdapterLoaderStore.includeAdapterJS();

  const socket_msg_procs = {
    'connect': _processConnect,
    'message': _processMessage
  }

  SignalService.initSignalService(newConfID, socket_msg_procs);
}
function joinConference() {
  SignalService.sendMessage(JSON.stringify(_buildPeerSyn()), PEER_ID);
}
function leaveConference() {
  _detachLocal();
}
function once(callback) {
  event_emitter.once(CHANGE_EVENT, callback);
}
function peerStoreChanged(tag) {
  event_emitter.emit(REMOTE_CHANGE_EVENT, tag);
}
function removeChangeListener(callback) {
  event_emitter.removeListener(CHANGE_EVENT, callback);
}
function removeReadyListener(callback) {
  event_emitter.removeListener(READY_EVENT, callback);
}
function removeRemoteChangeListener(callback) {
  event_emitter.removeListener(REMOTE_CHANGE_EVENT, callback);
}
function toggleLocalAudio() {
  const audio_state = LocalStreamStore.toggleLocalAudio();
  SignalService.sendMessage(JSON.stringify({audio: audio_state}), PEER_ID);
}
function toggleLocalVideo() {
  const video_state = LocalStreamStore.toggleLocalVideo();
  SignalService.sendMessage(JSON.stringify({video: video_state}), PEER_ID);
}

PeerStore.addChangeListener(peerStoreChanged);
AdapterLoaderStore.addChangeListener(_checkConnectivity);
UserStore.addChangeListener(_setUser);

export default {
  addChangeListener,
  addReadyListener,
  addRemoteChangeListener,
  attachStream,
  fetchLocal,
  getPeerAudioState,
  getPeerName,
  getPeerVideoState,
  initConference,
  joinConference,
  leaveConference,
  once,
  removeChangeListener,
  removeReadyListener,
  removeRemoteChangeListener,
  toggleLocalAudio,
  toggleLocalVideo
};
