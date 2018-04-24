'use strict';

import React from 'react';

import PureComponent from './pure_component.js';
import Loading from './loading.js';
import PlayIcon from './play_icon.js';
import HTML5VideoPlayer from './html5_video_player.js';
import HLSJSVideoPlayer from './hlsjs_video_player.js';
import MediaElementPlayer from './media_element_player.js';

import ResourceStore from '../stores/resource_store.js';

import util from '../util.js';

require('../../css/video_player.less');

const g_hls_support_type = util.hlsSupportType();

export default class VideoPlayer extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this.state = {
      currentTime: 0,
      bufferedTime: 0,
      is_loading: true,
      is_seeking: false,
      is_paused: true,
      is_stalled: false,
    };
    this.maybe_stalled = false;
  }
  static propTypes = {
    video: React.PropTypes.object.isRequired,
    paused: React.PropTypes.bool,
    onVideoClick: React.PropTypes.func,
    onEnded: React.PropTypes.func,
    onTimeUpdate: React.PropTypes.func,
  };
  static defaultProps = {
    paused: false,
    onVideoClick: function() {},
    onEnded: function() {},
    onTimeUpdate: function() {},
  };
  _videoTimeUpdate({ currentTime, bufferedTime }) {
    const { is_stalled, currentTime: old_time, is_paused } = this.state;
    const { maybe_stalled } = this;
    if (currentTime > old_time) {
      if (maybe_stalled) {
        this.maybe_stalled = false;
      }
      if (is_stalled) {
        this.setState({ is_stalled: false });
      }
    } else if (maybe_stalled) {
      if (is_paused) {
        this.maybe_stalled = false;
      } else {
        this.maybe_stalled = false;
        this.setState({ is_stalled: true });
      }
    }
    this.setState({ currentTime, bufferedTime });
    this.props.onTimeUpdate({ currentTime, bufferedTime });
  }
  _videoStateUpdate(state) {
    const PROPS = ['paused','ended','seeking','loading'];
    const new_state = {};
    _.each(PROPS,(p) => {
      const val = state[p];
      if (val !== undefined) {
        new_state["is_" + p] = val;
      }
    });

    if (this.state.is_loading && new_state.is_paused === false ) {
      new_state.is_loading = false;
    }
    if (state.stalled === false) {
      this.maybe_stalled = false;
      new_state.is_stalled = false;
    } else if (state.stalled === true) {
      if (this.maybe_stalled) {
        this.maybe_stalled = false;
        new_state.is_stalled = true;
      } else {
        this.maybe_stalled = true;
      }
    }

    this.setState(new_state);
  }
  seek(time) {
    this.refs.video.seek(time);
  }

  render() {
    const {
      video,
      paused,
      ended,
      format,
      muted,
      volume,
    } = this.props;
    const {
      is_loading,
      is_seeking,
      is_paused,
      is_stalled,
    } = this.state;

    let loading = null;
    let play = null;
    if (ended) {
      // no middle if ended
    } else if (paused) {
      play = (
        <div className="paused-container" onClick={this.props.onVideoClick}>
          <div className='big-play-button'>
            <div className='big-play-button-inner' />
          </div>
        </div>
      );
    } else if (is_loading || is_seeking || is_stalled) {
      loading = (
        <div className="loading-container" onClick={this.props.onVideoClick}>
          <Loading />
        </div>
      );
    }

    const { src, player_type } = _getPlayerSettings(video);
    let video_player = null;
    const video_player_props = {
      ref: "video",
      format,
      src,
      paused,
      muted,
      volume,
      onTimeUpdate: this._videoTimeUpdate.bind(this),
      onStateUpdate: this._videoStateUpdate.bind(this),
      onEnded: this.props.onEnded,
    };
    if (video.media_list && video.media_list.length > 0) {
      const { width, height } = video.media_list[0];
      video_player_props.aspect = width / height;
    }

    if (player_type == 'hls.js') {
      video_player = <HLSJSVideoPlayer {...video_player_props} />;
    } else if (player_type == 'html5') {
      video_player = <HTML5VideoPlayer {...video_player_props} />;
    } else if (player_type == 'flash') {
      video_player = <MediaElementPlayer {...video_player_props} />;
    } else if(player_type == 'needs_flash') {
      video_player = (
        <div className='needs-flash'>
          Please Install Flash
        </div>
      );
    } else {
      console.error("no player found.");
    }
    const container_style = {};
    if (is_loading) {
      const url = "url(" + video.channel_video_image_url + ")";
      container_style.backgroundImage = url;
    }

    const content = (
      <div className='video-player-container'>
        <div className='video-container'>
          {video_player}
          {loading}
          <div className='cover' onClick={this.props.onVideoClick} />
          {play}
        </div>
      </div>
    );
    return content;
  }
}

function _getPlayerSettings(video) {
  const has_flash = util.hasFlash();
  const {
    has_hls,
    has_mp4,
    has_insecure,

    hls_insecure_url,
    hls_secure_url,

    mp4_insecure_url,
    mp4_secure_url,
  } = ResourceStore.getVideoResource(video);

  const mp4_url = mp4_insecure_url || mp4_secure_url;

  let player_type = 'html5';
  let src = false;
  if (!has_hls) {
    player_type = 'html5';
    src = mp4_url;
  } else if (g_hls_support_type == 'native') {
    player_type = 'html5';
    src = hls_insecure_url || hls_secure_url;
  } else if (has_hls && g_hls_support_type == 'hls.js') {
    if (has_insecure && has_mp4) {
      player_type = 'html5';
      src = mp4_url;
    } else if (has_insecure && has_flash) {
      player_type = 'flash';
      src = hls_insecure_url || hls_secure_url;
    } else {
      // Alternative would be needs_flash
      player_type = 'hls.js';
      src = hls_secure_url;
    }
  } else if (has_hls && has_mp4 && g_hls_support_type == 'flash') {
    player_type = 'html5';
    src = mp4_url;
  } else if (has_hls && g_hls_support_type == 'flash') {
    player_type = 'flash';
    src = hls_insecure_url || hls_secure_url;
  } else if (has_hls && !has_mp4 && !g_hls_support_type) {
    player_type = 'needs_flash';
  }

  return { src, player_type };
}
