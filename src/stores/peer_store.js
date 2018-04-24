import EventEmitter from 'events';

const CHANGE_EVENT = "change";
const ICE_CONF = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'},
                                 {'url': 'stun:stun.l.google.com:19302'}]};

const all_peers_change_emitter = new EventEmitter();
let _all_peers = { };

function _createRTCPeerConnection(peerID, local_stream) {
  let pc = new RTCPeerConnection(ICE_CONF);
  pc.addStream(local_stream);
  return pc;
}
function _deletePeer(peerID) {
  if(_all_peers[peerID]) {
    delete _all_peers[peerID];
    all_peers_change_emitter.emit(CHANGE_EVENT, 'deleted');
  }
}
function _monitorPeerConnection(pc, peer_id) {
  function _findStat(o, type) {
    function __is(stat, type) {
      return stat.type == type && !stat.isRemote;
    }
    return o[Object.keys(o).find(key => __is(o[key], type))];
  }

  let last_packets = 0;
  let timeout_count = 0;
  const TIMEOUT_LIMIT = 3;
  let iv = setInterval(() => pc.getStats().then(stats => {
    let packets = _findStat(stats, "inboundrtp").packetsReceived;
    if (packets > last_packets) {
      timeout_count = 0;
    } else if (timeout_count < TIMEOUT_LIMIT) {
      timeout_count++;
    } else {
      clearInterval(iv);
      _deletePeer(peer_id);
    }
    last_packets = packets;
  }), 1000);
}
function _sendICECandidates(peerID, signal_service) {
  const candidates = _all_peers[peerID].ice_candidates;
  signal_service.sendMessage(JSON.stringify({ice: candidates}));
  _all_peers[peerID].ice_timeout = null;
}

function addChangeListener(callback) {
  all_peers_change_emitter.on(CHANGE_EVENT, callback);
}
function addIceCandidates(peerID, ice_candidates) {
  const peer = getPeerByID(peerID);
  if(peer.pc.localDescription && peer.pc.remoteDescription) {
    _.each(ice_candidates, (ice_candidate) => {
      peer.pc.addIceCandidate(new RTCIceCandidate(ice_candidate));
    });
  }
}
function addPeer(peerID, signal_service, local_stream) {
  _all_peers[peerID] = {
    ice_candidates: [],
    ice_timeout: null,
    pc: _createRTCPeerConnection(peerID, local_stream),
    stream: null,
    name: null,
    video_on: null,
    audio_on: null,
  };

  _all_peers[peerID].pc.onaddstream = function(evt) {
    _all_peers[peerID].stream = evt.stream;
    all_peers_change_emitter.emit(CHANGE_EVENT, 'added');
  };

  _all_peers[peerID].pc.oniceconnectionstatechange = function(evt) {
    const peer_obj = _all_peers[peerID];
    if(peer_obj && peer_obj.pc.iceConnectionState == 'connected') {
      if (navigator.mozGetUserMedia) {
    		_monitorPeerConnection(peer_obj.pc, peerID);
      }
    } else if(peer_obj && peer_obj.pc.iceConnectionState == 'disconnected') {
      _deletePeer(peerID);
    }
  };

  _all_peers[peerID].pc.onicecandidate = function(evt) {
    if (evt.candidate) {
      const new_candidate = {
        candidate: evt.candidate.candidate,
        sdpMid: evt.candidate.sdpMid,
        sdpMLineIndex: evt.candidate.sdpMLineIndex
      };

      _all_peers[peerID].ice_candidates.push(new_candidate);

      if(!_all_peers[peerID].ice_timeout) {
        _all_peers[peerID].ice_timeout = setTimeout(function () {
          _sendICECandidates(peerID, signal_service)
        }, 1000);
      }
    }
  };
}
function addPeerName(peerID, name) {
  _all_peers[peerID].name = name;
  all_peers_change_emitter.emit(CHANGE_EVENT, 'changed');
}
function getAllCompletedPeerIDs() {
  const filtered_peers = Object.keys(_all_peers);
  const peers_with_streams = [];

  _.each(filtered_peers, (peer_id) => {
    if(getPeerStream(peer_id)) {
      peers_with_streams.push(peer_id);
    }
  });

  return peers_with_streams;
}
function getPeerByID(peerID) {
  return _all_peers[peerID];
}
function getPeerAudioState(peerID) {
  let audio;
  const peer = getPeerByID(peerID);
  if(peer) {
    audio = peer.audio_on;
  }
  return audio;
}
function getPeerName(peerID) {
  let name;
  const peer = getPeerByID(peerID);
  if(peer) {
    name = peer.name;
  }
  return name;
}
function getPeerStream(peerID) {
  let stream;
  const peer = getPeerByID(peerID);
  if(peer) {
    stream = peer.stream;
  }
  return stream;
}
function getPeerRTCConnection(peerID) {
  let pc;
  const peer = getPeerByID(peerID);
  if(peer) {
    pc = peer.pc;
  }
  return pc;
}
function getPeerVideoState(peerID) {
  let video;
  const peer = getPeerByID(peerID);
  if(peer) {
    video = peer.video_on;
  }
  return video;
}
function removeChangeListener(callback) {
  all_peers_change_emitter.removeListener(CHANGE_EVENT, callback);
}
function setPeerStream(peerID, stream) {
  const peer = getPeerByID(peerID);
  if(peer) {
    peer.stream = stream;
  }
}
function updatePeerAudio(peerID, newAudioState) {
  const peer = getPeerByID(peerID);
  if(peer) {
    peer.audio_on = newAudioState;
    all_peers_change_emitter.emit(CHANGE_EVENT, 'changed');
  }
}
function updatePeerVideo(peerID, newVideoState) {
  const peer = getPeerByID(peerID);
  if(peer) {
    peer.video_on = newVideoState;
    all_peers_change_emitter.emit(CHANGE_EVENT, 'changed');
  }
}

export default {
  addChangeListener,
  addIceCandidates,
  addPeer,
  addPeerName,
  getAllCompletedPeerIDs,
  getPeerAudioState,
  getPeerByID,
  getPeerName,
  getPeerRTCConnection,
  getPeerStream,
  getPeerVideoState,
  removeChangeListener,
  setPeerStream,
  updatePeerAudio,
  updatePeerVideo,
};
