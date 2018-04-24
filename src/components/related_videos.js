'use strict';

import React from 'react';

import VideoCard from './video_card.js';
import Loading from './loading.js';

import VideoStore from '../stores/video_store.js';

export default class RelatedVideos extends React.Component {
  constructor(props,context) {
    super(props,context);
    this.state = {
      recent_video_list: [],
    };
    this._onVideoUpdate = this._onVideoUpdate.bind(this);
    this._onVideoClick = this._onVideoClick.bind(this);
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };
  static propTypes = {
    channel: React.PropTypes.object.isRequired,
    video: React.PropTypes.object.isRequired,
  };
  componentDidMount() {
    VideoStore.addChangeListener(this._onVideoUpdate);
    VideoStore.fetchRecent();
    this._onVideoUpdate();
  }
  componentWillUnmount() {
    VideoStore.removeChangeListener(this._onVideoUpdate);
  }
  _onVideoUpdate(tag) {
    const { video } = this.props;
    const recent_video_list = VideoStore.getRecentVideos().filter((v) => {
      return v.channel_video_id != video.channel_video_id;
    });
    this.setState({ recent_video_list });
  }
  _onVideoClick(video) {
    const { channel_id, channel_video_id } = video;
    const url = "/channel/" + channel_id + "/video/" + channel_video_id;
    this.context.router.replace(url);
  }

  render() {
    const { channel, video } = this.props;
    const { recent_video_list } = this.state;

    const channel_video_list = channel.video_list.filter((v) => {
      return v.channel_video_id != video.channel_video_id;
    }).map((v) => {
      v.channel_id = channel.channel_id;
      v.channel_name = channel.channel_name;
      return v;
    });
    const all_videos = [...channel_video_list,...recent_video_list];
    const video_list = _.uniq(all_videos, 'channel_video_id').splice(0, 3);

    let inner = null;
    if (video_list) {
      inner = _.map(video_list,(v) => {
        const { channel_video_id } = v;
        return (
          <VideoCard
            key={"channel_video_" + channel_video_id}
            video={v}
            onClick={this._onVideoClick}
          />
        );
      });
    } else {
      inner = (
        <div className='loading-container'>
          <Loading color="#999" />
        </div>
      );
    }
    const content = (
      <div className='video-list'>
        {inner}
      </div>
    );
    return content;
  }
}
