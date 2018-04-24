'use strict';

import React from 'react';
import Hls from 'hls.js';
import HTML5VideoPlayer from './html5_video_player.js';

export default class HLSJSVideoPlayer extends HTML5VideoPlayer {
  constructor(props,context) {
    super(props,context);
    this.hls = false;
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
  componentDidMount() {
    const config = {};
    if (localStorage.debug_hls) {
      config.enableWorker = false;
    }
    this.hls = new Hls(config);
    window.hls = this.hls;
    this._loadVideo(this.props.src);
    this.hls.attachMedia(this.refs.player);
  }
  componentWillUnmount() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = false;
    }
  }
  _loadVideo(src) {
    this.hls && this.hls.loadSource(src);
  }
  seek(time) {
    super.seek(time);
  }
}
