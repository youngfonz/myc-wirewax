'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import ChannelTopBar from './channel_top_bar.js';
import PureComponent from './pure_component.js';
import ConferenceFeed from './conference_feed.js';
import LoadingOverlay from './loading_overlay.js';

require('../../css/buttons.less');

export default class ConferenceJoinMode extends PureComponent {
  static propTypes = {
    channel: React.PropTypes.object.isRequired,
    conference: React.PropTypes.object.isRequired,
    isCameraOff: React.PropTypes.bool.isRequired,
    isFaded: React.PropTypes.bool,
    isMuted: React.PropTypes.bool.isRequired,
    joinConference: React.PropTypes.func.isRequired,
    toggleAudio: React.PropTypes.func.isRequired,
    toggleVideo: React.PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.state = { stream_ready: false };
    this._streamIsReady = this._streamIsReady.bind(this);

    DataCortex.event({
      kingdom: 'conference',
      phylum: 'join_conference',
      species: props.conference.conference_id,
    });
  }

  _streamIsReady() {
    this.setState({ stream_ready: true });
  }

  render() {
    const {
      channel,
      conference,
      isCameraOff,
      isFaded,
      isMuted,
      joinConference,
      toggleAudio,
      toggleVideo
    } = this.props;
    const { stream_ready } = this.state;

    let channel_name = "";
    let loading;
    const overlay_class = "conference-video-channel-overlay" + (isFaded ? " faded" : "");

    if(channel && channel.channel_name) {
      channel_name = channel.channel_name;
    }

    if(!stream_ready) {
      loading = <LoadingOverlay />;
    }

    return (
      <div className="conference-page-join-container">
        { loading }
        <div className="conference-join-container">
          <div className="local-video-preview">
            <ConferenceFeed
              muted={true}
              onReady={ this._streamIsReady }
              audioState={ !isMuted }
              videoState={ !isCameraOff }
              />
          </div>
          <div className="local-video-controls">
            <div className="audio-video-buttons">
              <div className="mic-and-video-buttons">
                <div
                  className={"mic-on-off-button" + (isMuted ? " off" : "")}
                  onClick={toggleAudio}
                  >
                  <div />
                </div>
                <div
                  className={"camera-on-off-button" + (isCameraOff ? " off" : "")}
                  onClick={toggleVideo}
                  >
                  <div />
                </div>
              </div>
              <div className="join-button-container">
                <div className="button" onClick={ joinConference }>
                  <div className="button-text">Join</div>
                </div>
              </div>
            </div>
          </div>
          <div className={overlay_class}>
            <ChannelTopBar
              channelName={channel_name}
              videoTitle={conference.conference_name}
              />
          </div>
        </div>
      </div>
    );
  }
}
