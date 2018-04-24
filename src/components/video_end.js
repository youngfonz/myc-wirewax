'use strict';

import React from 'react';

import util from '../util.js';

import PureComponent from './pure_component.js';
import CountdownTimer from './countdown_timer.js';

import VideoStore from '../stores/video_store.js';

export default class VideoEnd extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this.state = {
      next_video: false,
    };
    this._onVideoStoreUpdate = this._onVideoStoreUpdate.bind(this);
    this._onNext = this._onNext.bind(this);
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };
  static propTypes = {
    channel: React.PropTypes.object.isRequired,
    canDisplayVideoReply: React.PropTypes.bool,
    video: React.PropTypes.object.isRequired,
    onNext: React.PropTypes.func,
    onReplay: React.PropTypes.func,
    onReply: React.PropTypes.func,
    onShare: React.PropTypes.func,
    user: React.PropTypes.object,
  };
  static defaultProps = {
    canDisplayVideoReply: false,
    onNext: function() {},
    onReplay: function() {},
    onReply: function() {},
    onShare: function() {},
    user: { is_admin: false },
  };
  componentDidMount() {
    VideoStore.fetchRecent();
    this._onVideoStoreUpdate();
  }
  componentWillUnmount() {
  }
  _onVideoStoreUpdate() {
    const next_video = this._findNext();
    this.setState({ next_video });
  }

  _findNext() {
    const { channel, video } = this.props;
    const { channel_video_id } = video;

    let next_video = false;

    if (channel.video_list.length > 1) {
      let index = _.findIndex(channel.video_list,{ channel_video_id }) + 1;
      if (index > channel.video_list.length - 1) {
        index = 0;
      }
      next_video = channel.video_list[index];
    } else {
      const recent_list = VideoStore.getRecentVideos();
      let index = _.findIndex(recent_list,{ channel_video_id }) + 1;
      if (index > recent_list.length - 1) {
        index = 0;
      }
      next_video = recent_list[index];
    }
    return next_video;
  }
  _onNext() {
    const { next_video } = this.state;
    const { channel_id, channel_video_id } = next_video;

    const url = "/channel/" + channel_id + "/video/" + channel_video_id;
    this.context.router.push(url);
  }

  render() {
    const {
      channel,
      video,
      onNext,
      onReplay,
      onReply,
      onShare,
      user,
    } = this.props;

    const {
      next_video
    } = this.state;

    let next = null;
    let video_bg = null;
    if (next_video) {
      next = (
        <div className='next-video-title'>{next_video.title}</div>
      );
      const style = {
        backgroundImage: "url(" + next_video.channel_video_image_url + ")",
      };
      video_bg = (
        <div className='video-image' style={style} />
      );
    }

    return (
      <div className='video-end-container' onClick={util.stopAll}>
        {video_bg}
        <div className='content'>
          <div className='thanks-title'>Up Next</div>
          {next}
          <CountdownTimer onNext={this._onNext} />
        </div>
      </div>
    );
  }
}
