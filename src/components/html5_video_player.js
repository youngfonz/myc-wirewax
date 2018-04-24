'use strict';

import React from 'react';
import PureComponent from './pure_component.js';

import util from '../util.js';

export default class HTML5VideoPlayer extends PureComponent {
  constructor(props,context) {
    super(props,context);

    this._onCanPlay = this._onCanPlay.bind(this);
    this._onTimeUpdate = this._onTimeUpdate.bind(this);
    this._onStateUpdate = this._onStateUpdate.bind(this);
  }
  static propTypes = {
    src: React.PropTypes.string.isRequired,
    paused: React.PropTypes.bool,
    onEnded: React.PropTypes.func,
    onTimeUpdate: React.PropTypes.func,
    onStateUpdate: React.PropTypes.func,
  };
  static defaultProps = {
    paused: false,
    aspect: 16/9,
    onEnded: function() {},
    onTimeUpdate: function() {},
    onStateUpdate: function() {},
  };

  _loadVideo(src) {
    const { player } = this.refs;
    try {
      player.src = src;
      player.load();
    } catch(e) {
      console.error("HTML5VideoPlayer._loadVideo: set src err:",e);
    }
  }

  componentWillReceiveProps(new_props) {
    const { player } = this.refs;
    const {
      volume: old_volume,
      muted: old_muted,
      video: old_video,
      src: old_src,
      paused: old_paused,
    } = this.props;
    const {
      video,
      volume,
      muted,
      src,
      paused,
    } = new_props;
    if (old_paused && !paused) {
      player.play();
    } else if (!old_paused && paused) {
      player.pause();
    }

    if (old_src != src) {
      this._loadVideo(src);
      player.muted = muted;
      player.volume = volume;
      this.props.onStateUpdate({ loading: true });
    }

    if (old_volume != volume) {
      player.volume = volume;
    }
    if (old_muted != muted) {
      player.muted = muted;
    }
  }
  _onTimeUpdate(e) {
    const { player } = this.refs;
    const { currentTime } = player;
    const buffered = player.buffered;
    let bufferedTime = 0;
    for (let i = 0 ; i < buffered.length ; ++i) {
      const start = buffered.start(i);
      const end = buffered.end(i);
      if (currentTime >= start && currentTime < end) {
        bufferedTime = end;
        break;
      }
    }
    this.props.onTimeUpdate({ currentTime, bufferedTime });
  }
  _onCanPlay(e) {
    const { player } = this.refs;
    if (player.readyState > 2 && player.paused && !this.props.paused) {
      this.props.onStateUpdate({ paused: false });
      player.play();

      const { volume, muted } = this.props;
      player.volume = volume;
      player.muted = muted;
    }
  }
  _onStateUpdate(e) {
    const { type } = e;
    const { player } = this.refs;
    let { seeking, paused } = player;
    const state_update = { seeking, paused };
    if (type == 'stalled' || type == 'waiting') {
      state_update.stalled = true;
    } else if (type == 'playing') {
      // Safari had the player seeking while the video was marked as
      // "playing", which seems incongruous. This kept a loader on the
      // page when the video was playing, which was undesirable.
      state_update.seeking = false;
    }
    this.props.onStateUpdate(state_update);
  }
  seek(time) {
    this.refs.player.currentTime = time;
  }

  render() {
    const { src, volume, muted } = this.props;
    const content = (
      <div className='html5-video-container'>
        <video
          ref="player"
          src={src}
          preload="auto"
          volume={volume}
          muted={muted}
          onLoadedData={this._onCanPlay}
          onCanPlay={this._onCanPlay}
          onCanPlayThrough={this._onCanPlay}
          onProgress={this._onTimeUpdate}
          onTimeUpdate={this._onTimeUpdate}
          onPlay={this._onStateUpdate}
          onPause={this._onStateUpdate}
          onPlaying={this._onStateUpdate}
          onStalled={this._onStateUpdate}
          onWaiting={this._onStateUpdate}
          onEnded={this.props.onEnded}
        />
      </div>
    );
    return content;
  }
}
