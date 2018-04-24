'use strict';

import React from 'react';

import PureComponent from './pure_component.js';
import Loading from './loading.js';
import VideoEmojiGraph from './video_emoji_graph.js';

import AnalyticsStore from '../stores/analytics_store.js';
import ChatStore from '../stores/chat_store.js';

import util from '../util.js';

require('../../css/modal.less');
require('../../css/video_analytics.less');

export default class VideoAnalytics extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this.state = {
      channel_data: false,
    };
    this.channel_id = props.channel.channel_id;
    this.video_id = props.video.channel_video_id;

    this.chat_store = ChatStore.getStore(props.video);
    this._onAnalyticsChange = this._onAnalyticsChange.bind(this);
    this._onChatChange = this._onChatChange.bind(this);
  }
  static propTypes = {
    channel: React.PropTypes.object.isRequired,
    video: React.PropTypes.object.isRequired,
    onCloseClick: React.PropTypes.func.isRequired,
  };
  componentDidMount() {
    AnalyticsStore.addChangeListener(this._onAnalyticsChange);
    this._onAnalyticsChange();
    AnalyticsStore.fetchChannelVideo(this.props.video);

    this.chat_store.addChangeListener(this._onChatChange);
  }
  componentWillUnmount() {
    AnalyticsStore.removeChangeListener(this._onAnalyticsChange);
    this.chat_store.removeChangeListener(this._onChatChange);
  }

  _onAnalyticsChange(tag) {
    const channel_data = AnalyticsStore.getChannelData(this.channel_id);
    this.setState({ channel_data });
  }
  _onChatChange(tag) {
    AnalyticsStore.fetchChannelVideo(this.props.video);
  }

  render() {
    const {
      channel,
      video,
      onCloseClick,
    } = this.props;
    const {
      channel_data,
    } = this.state;

    let video_data = false;
    if (channel_data) {
      const { video_list } = channel_data;
      video_data = _.find(video_list,(v) => v.channel_video_id == this.video_id);
    }

    let content = null;
    if (channel_data && video_data) {
      content = (
        <div className='modal-container video-analytics-container' onClick={util.stopAll}>
          <div className='modal-top-bar'>
            <div className='modal-title-container'>
              <div className='analytics-title'>Video Analytics</div>
            </div>
            <div className="close-button-container">
              <div className='close-button white' onClick={onCloseClick}>
                <div />
              </div>
            </div>
          </div>
          <div className='statistics-list'>
            <div className='item'>
              <div className='value'>{video_data.view_count || 0}</div>
              <div className='text'>Total Views</div>
            </div>
            <div className='item'>
              <div className='value'>{video_data.message_count || 0}</div>
              <div className='text'>Chats</div>
            </div>
            <div className='item'>
              <div className='value'>{video_data.message_liked_count || 0}</div>
              <div className='text'>Sparks</div>
            </div>
            <div className='item'>
              <div className='value'>{video_data.promoted_count || 0}</div>
              <div className='text'>Ignites</div>
            </div>
            <div className='item'>
              <div className='value'>{video_data.share_count || 0}</div>
              <div className='text'>Shares</div>
            </div>
            <div className='item'>
              <div className='value'>{video_data.subscription_count || 0}</div>
              <div className='text'>Viewers</div>
            </div>
          </div>
          <div className='sep' />
          <div className='graph-title'>Video Pulse</div>
          <div className='graph-body'>
            <VideoEmojiGraph channel={channel} video={video} />
          </div>
        </div>
      );
    } else {
      content = (
        <div className='video-analytics-container' onClick={util.stopAll}>
          <Loading />;
        </div>
      );
    }
    return content;
  }
}
