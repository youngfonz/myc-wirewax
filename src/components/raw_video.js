'use strict';

import React from 'react';

import PureComponent from './pure_component.js';
import RawVideoHTML5 from './raw_video_html5.js';
import RawVideoHLSJS from './raw_video_hlsjs.js';
import RawVideoMediaElement from './raw_video_media_element.js';

import ResourceStore from '../stores/resource_store.js';

import util from '../util.js';

const g_hls_support_type = util.hlsSupportType();

export default class RawVideo extends PureComponent {
  constructor(props,context) {
    super(props,context);

    const { video } = props;
    const { src, player_type } = _getPlayerSettings(video);

    this.state = {
      src,
      player_type,
    };
  }
  static propTypes = {
    video: React.PropTypes.object.isRequired,
  };
  componentWillReceiveProps(newProps) {
    const { video } = newProps;
    const { src, player_type } = _getPlayerSettings(video);
    this.setState({ src, player_type });
  }

  getVideo() {
    return this.refs && this.refs.video && this.refs.video.getVideo();
  }

  render() {
    const { video, ...other_props } = this.props;
    const { src, player_type } = this.state;

    const video_player_props = _.extend({},other_props,{
      ref: "video",
      src,
    });

    let content = null;
    if (player_type == 'hls.js') {
      content = <RawVideoHLSJS {...video_player_props} />;
    } else if (player_type == 'html5') {
      content = <RawVideoHTML5 {...video_player_props} />;
    } else if (player_type == 'flash') {
      content = <RawVideoMediaElement {...video_player_props} />;
    } else if(player_type == 'needs_flash') {
      content = (
        <div className='needs-flash'>
          Please Install Flash
        </div>
      );
    } else {
      console.error("RawVideo: no player found.");
    }

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
