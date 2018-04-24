'use strict';

import React from 'react';

import PureComponent from './pure_component.js';

import util from '../util.js';

require('../../css/top_buttons.less');

export default class ChannelTopBar extends PureComponent {
  static propTypes = {
    channelName: React.PropTypes.string.isRequired,
    videoTitle: React.PropTypes.string.isRequired,
    onChatClick: React.PropTypes.func,
    isChatOpen: React.PropTypes.bool,
    messageCount: React.PropTypes.number,
    onAnalyticsClick: React.PropTypes.func,
  };
  static defaultProps = {
    messageCount: 0,
  };

  render() {
    const {
      onChatClick,
      isChatOpen,
      onAnalyticsClick,
      messageCount,
    } = this.props;

    let chat_button = null;
    if (onChatClick) {
      const cls = 'top-button chat' + (isChatOpen ? ' open' : '');
      chat_button = (
        <div
          className={cls}
          title="Toggle Chat Panel"
          onClick={onChatClick}
        >
          <div className='icon' />
          <div className='count'>{messageCount}</div>
        </div>
      );
    }
    let analytics_button = null;
    if (onAnalyticsClick) {
      analytics_button = (
        <div
          className='top-button analytics'
          title="Video Analytics"
          onClick={onAnalyticsClick}
        >
          <div className='icon' />
        </div>
      );
    }

    return (
      <div className='top-bar auto-fade' onClick={util.stopAll}>
        <div className='channel-video'>
          <div className='channel-name'>#{this.props.channelName}</div>
          <div className='video-title'>{this.props.videoTitle}</div>
        </div>
        {analytics_button}
        {chat_button}
      </div>
    );
  }
};
