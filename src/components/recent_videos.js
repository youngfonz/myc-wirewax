'use strict';

import React from 'react';

import VideoCard from './video_card.js';
import Loading from './loading.js';

import VideoStore from '../stores/video_store.js';

require('../../css/video_list.less');

export default class RecentVideos extends React.Component {
  constructor(props,context) {
    super(props,context);
    this.state = {
      video_list: false,
    };
    this._onVideoUpdate = this._onVideoUpdate.bind(this);
  }
  static propTypes = {
    onVideoClick: React.PropTypes.func.isRequired,
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
    const video_list = VideoStore.getRecentVideos();
    if (video_list && video_list.length > 0) {
      video_list.splice(3);
    }
    this.setState({ video_list });
  }

  render() {
    const { video_list } = this.state;

    let inner = null;
    if (video_list) {
      inner = _.map(video_list,(cv) => {
        const { channel_video_id } = cv;
        return (
          <VideoCard
            key={"channel_video_" + channel_video_id}
            video={cv}
            onClick={this.props.onVideoClick}
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
