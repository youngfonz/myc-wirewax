'use strict';

import React from 'react';
import PureComponent from './pure_component.js';

import util from '../util.js';

export default class MediaElementPlayer extends PureComponent {
  constructor(props,context) {
    super(props,context);

    window.media_element_player = this;
    this.media = false;
    this.media_element = false;
    this.resize_after_timeupdate = false;

    this._onResize = this._onResize.bind(this);
    this._onTimeUpdate = this._onTimeUpdate.bind(this);
    this._onStateUpdate = this._onStateUpdate.bind(this);
    this._onEnded = this._onEnded.bind(this);
  }
  static propTypes = {
    src: React.PropTypes.string.isRequired,
    paused: React.PropTypes.bool,
    onVideoClick: React.PropTypes.func,
    onEnded: React.PropTypes.func,
    onTimeUpdate: React.PropTypes.func,
    onStateUpdate: React.PropTypes.func,
  };
  static defaultProps = {
    paused: false,
    aspect: 16/9,
    onVideoClick: function() {},
    onEnded: function() {},
    onTimeUpdate: function() {},
    onStateUpdate: function() {},
  };
  componentDidMount() {
    const v = $('#media-element-video')[0];
    const { width, height, marginTop } = this._getSize();
    v.width = width;
    v.height = height;

    this.media_element = new MediaElement(v,{
      success: (media) => {
        const $me_plugin = $(this.refs.container).find('.me-plugin');
        $me_plugin.css({ marginTop: marginTop });

        window.media = media;

        this.media = media;
        media.addEventListener('progress',this._onTimeUpdate);
        media.addEventListener('timeupdate',this._onTimeUpdate);
        media.addEventListener('play',this._onStateUpdate);
        media.addEventListener('playing',this._onStateUpdate);
        media.addEventListener('pause',this._onStateUpdate);
        media.addEventListener('ended',this._onEnded);
        this._loadVideo(this.props);
      },
      error: () => {
        console.error("ME error:",arguments);
      },
    });
    util.addResizeListener(this._onResize);
  }
  componentWillUnmount() {
    util.removeResizeListener(this._onResize);
    if (this.media) {
      this.media.removeEventListener();
    }
  }
  componentWillReceiveProps(new_props) {
    const {
      volume: old_volume,
      muted: old_muted,
      video: old_video,
      src: old_src,
      paused: old_paused,
      format: old_format,
    } = this.props;
    const {
      video,
      volume,
      muted,
      src,
      paused,
      format,
    } = new_props;
    if (src != old_src) {
      this._loadVideo(new_props);
    }
    if (old_paused && !paused) {
      this.media && this.media.play();
    } else if (!old_paused && paused) {
      this.media && this.media.pause();
    }
    if (old_format !== format) {
      util.afterRender(this._onResize);
    }

    if (volume != old_volume) {
      this.media && this.media.setVolume(volume);
    }
    if (muted != old_muted) {
      this.media && this.media.setMuted(muted);
    }
  }
  _getSize() {
    const { aspect } = this.props;
    const $container = $(this.refs.container);
    let width = $container.width();
    let height = $container.height();
    let marginTop = 0;
    const container_aspect = width / height;
    if (container_aspect > aspect) {
      width = height * aspect;
    } else {
      const new_height = width / aspect;
      marginTop = (height - new_height) / 2;
      height = new_height;
    }

    return { width, height, marginTop };
  }
  _loadVideo(props) {
    const { src, volume, muted } = props;
    this.media.setSrc(src);
    this.media.play();
    this.media.setVolume(volume);
    this.media.setMuted(muted);
    this.resize_after_timeupdate = true;
  }
  _onTimeUpdate(e) {
    const { bufferedTime, currentTime } = e;
    this.props.onTimeUpdate({ bufferedTime, currentTime });
    if (this.resize_after_timeupdate) {
      this.resize_after_timeupdate = false;
      util.afterRender(this._onResize);
    }
  }
  _onStateUpdate(e) {
    const { paused, ended } = e;
    this.props.onStateUpdate({ paused, ended });
  }
  _onEnded(e) {
    this.props.onEnded();
  }

  _onResize(reason) {
    if (this.media) {
      const { width, height, marginTop } = this._getSize();
      this.media.setVideoSize(width,height);
      const $me_plugin = $(this.refs.container).find('.me-plugin');
      $me_plugin.css({ marginTop: marginTop });
    }
  }

  _rawMarkup(src) {
    const html =
"<video id='media-element-video'>"
+ "<source type='application/x-mpegURL' src='https://media11.cdn.myc-dev.com/mediaelement.m3u8'/>"
+ "</video>";
    return {
      __html: html,
    };
  }
  seek(time) {
    if (this.media) {
      this.media.setCurrentTime(time);
    }
  }

  render() {
    const { src } = this.props;
    const content = (
      <div
        ref="container"
        className='media-element-container'
        dangerouslySetInnerHTML={this._rawMarkup(src)}
      />
    );
    return content;
  }
}

