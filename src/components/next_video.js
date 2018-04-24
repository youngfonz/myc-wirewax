'use strict';

import React from 'react';

import PureComponent from './pure_component.js';

import VideoStore from '../stores/video_store.js';

export default class NextVideo extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this.state = {};
    this._onClick = this._onClick.bind(this);
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };
  static propTypes = {
    channel: React.PropTypes.object.isRequired,
    video: React.PropTypes.object.isRequired,
    containerClass: React.PropTypes.string,
  };
  static defaultProps = {
    containerClass: ""
  };

  componentDidMount() {
    VideoStore.fetchRecent();
  }
  _onClick() {
    const { channel, video } = this.props;
    const { channel_video_id } = video;

    let channel_id = false;
    let video_id = false;

    if (channel.video_list.length > 1) {
      let index = _.findIndex(channel.video_list,{ channel_video_id }) + 1;
      if (index > channel.video_list.length - 1) {
        index = 0;
      }
      channel_id = channel.channel_id;
      video_id = channel.video_list[index].channel_video_id;
    } else {
      const recent_list = VideoStore.getRecentVideos();
      let index = _.findIndex(recent_list,{ channel_video_id }) + 1;
      if (index > recent_list.length - 1) {
        index = 0;
      }
      const recent_video = recent_list[index];
      channel_id = recent_video.channel_id;
      video_id = recent_video.channel_video_id;
    }
    const url = "/channel/" + channel_id + "/video/" + video_id;
    this.context.router.replace(url);
  }

  render() {
    let content;
    const container_class = this.props.containerClass || 'next-video-button';

    if(this.props.children) {
      content = (
        <div className={ container_class } onClick={this._onClick}>
          { this.props.children }
        </div>
      );
    } else {
      content = <div className={ container_class } onClick={this._onClick} />;
    }

    return content;
  }
}
