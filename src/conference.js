'use strict';

import React from 'react';
import _ from 'lodash';
import DataCortex from 'browser-data-cortex';

import util from './util.js';

import LoadingOverlay from './components/loading_overlay.js';
import PureComponent from './components/pure_component.js';
import ConferencingMode from './components/conferencing_mode.js';
import ConferenceJoinMode from './components/conference_join_mode.js';

import ChannelStore from './stores/channel_store.js';
import PeerStore from './stores/peer_store.js';
import VideoConferenceStore from './stores/video_conference_store.js';

require('../css/conference.less');

const FADE_TIMEOUT_MS = 4*1000;

export default class Conference extends PureComponent {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      channel: false,
      channel_id: props.params.channel_id,
      conference: false,
      conference_id: props.params.conference_id,
      is_camera_off: false,
      is_chat_open: false,
      is_faded: false,
      is_loading: true,
      is_muted: false,
      joined: false,
      remote_peers: [],
      user: props.params.user,
    };

    DataCortex.event({
      kingdom: 'page_view',
      phylum: 'conference',
      species: props.params.conference_id,
    });

    this._joinConference = this._joinConference.bind(this);
    this._onChannelUpdate = this._onChannelUpdate.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onRemotePeersChanged = this._onRemotePeersChanged.bind(this);
    this._toggleAudio = this._toggleAudio.bind(this);
    this._toggleVideo = this._toggleVideo.bind(this);

    this._onChatClick = this._onChatClick.bind(this);

    this.fadeTimeout = false;
    this._startFadeTimeout = this._startFadeTimeout.bind(this);
    this._clearFadeTimeout = this._clearFadeTimeout.bind(this);
  }

  _clearFadeTimeout() {
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = false;
    }
  }
  _joinConference() {
    this.setState({joined: true});
    VideoConferenceStore.joinConference();
  }
  _onChannelUpdate(tag) {
    const { channel_id, conference_id } = this.state;
    const channel = ChannelStore.getChannel(channel_id);

    if(channel !== false) {
      const conference = _.find(channel.conference_list, (conf) => conference_id == conf.conference_id);
      if(conference) {
        this.setState({ channel, conference, is_loading: false });
      }
    }
  }
  _onChatClick(e) {
    util.stopAll(e);
    this.setState({ is_chat_open: !this.state.is_chat_open });
    _.times(10,(n) => {
      util.fireResizeLater('chat-click-' + n,n*100);
    });
  }
  _onMouseMove() {
    this._startFadeTimeout();
    this.setState({ is_faded: false });
  }
  _onReady() {
    VideoConferenceStore.fetchLocal(false);
  }
  _onRemotePeersChanged() {
    this.setState({ remote_peers: PeerStore.getAllCompletedPeerIDs() });
  }
  _startFadeTimeout() {
    this._clearFadeTimeout();
    this.fadeTimeout = setTimeout(() => {
      this.setState({ is_faded: true });
    },FADE_TIMEOUT_MS);
  }
  _toggleAudio() {
    VideoConferenceStore.toggleLocalAudio(this.state.is_camera_off, this.state.is_muted);
    this.setState({is_muted: !this.state.is_muted});
  }
  _toggleVideo() {
    VideoConferenceStore.toggleLocalVideo(this.state.is_camera_off, this.state.is_muted);
    this.setState({is_camera_off: !this.state.is_camera_off});
  }

  componentDidMount() {
    const { channel_id, conference_id } = this.state;

    ChannelStore.addChangeListener(this._onChannelUpdate);
    ChannelStore.fetch();

    this._onChannelUpdate();
    this._startFadeTimeout();
    document.addEventListener('mousemove',this._onMouseMove);

    VideoConferenceStore.initConference(conference_id);
    VideoConferenceStore.addReadyListener(this._onReady);
    VideoConferenceStore.addRemoteChangeListener(this._onRemotePeersChanged);
    this._onRemotePeersChanged();
  }
  componentWillReceiveProps(newProps) {
    const { channel } = this.state;
    const { channel_id, conference_id, user } = newProps.params;

    this.setState({ channel_id, conference_id, user });

    if (channel && channel.channel_id != channel_id) {
      this.setState({ channel: false, is_loading: true });
      ChannelStore.fetch();
    }
  }
  componentWillUnmount() {
    this._clearFadeTimeout();

    document.removeEventListener('mousemove',this._onMouseMove);
    ChannelStore.removeChangeListener(this._onChannelUpdate);
    VideoConferenceStore.removeReadyListener(this._onReady);
    VideoConferenceStore.removeRemoteChangeListener(this._onRemotePeersChanged);

    VideoConferenceStore.leaveConference();
  }
  render() {
    let conference_out = null;
    if(this.state.is_loading) {
      conference_out = <LoadingOverlay />;
    }
    else {
      const {
        channel,
        conference,
        is_camera_off,
        is_chat_open,
        is_faded,
        is_muted,
        remote_peers,
        user
      } = this.state;

      if(this.state.joined) {
        conference_out = <ConferencingMode
          channel={channel}
          conference={conference}
          isCameraOff={is_camera_off}
          isChatOpen={is_chat_open}
          isFaded={is_faded}
          isMuted={is_muted}
          onChatClick={this._onChatClick}
          remotePeers={remote_peers}
          toggleAudio={this._toggleAudio}
          toggleVideo={this._toggleVideo}
          user={user}
        />;
      } else {
        conference_out = <ConferenceJoinMode
          channel={channel}
          conference={conference}
          isCameraOff={is_camera_off}
          isFaded={is_faded}
          isMuted={is_muted}
          joinConference={this._joinConference}
          toggleAudio={this._toggleAudio}
          toggleVideo={this._toggleVideo}
        />;
      }
    }

    return conference_out;
  }
}
