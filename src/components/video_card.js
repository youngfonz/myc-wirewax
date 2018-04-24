'use strict';

import React from 'react';

import util from '../util.js';

require('../../css/video_card.less');

export default class VideoCard extends React.Component {
  constructor(props,context) {
    super(props,context);

    this._onClick = this._onClick.bind(this);
  }
  static propTypes = {
    video: React.PropTypes.object.isRequired,
    onClick: React.PropTypes.func.isRequired,
  };

  _onClick() {
    this.props.onClick(this.props.video);
  }

  render() {
    const { video } = this.props;

    const style = {
      backgroundImage: "url(" + video.channel_video_image_url + ")",
    };
    let channel = null;
    if (video.channel_name) {
      channel = (
        <div className='channel-name'>{"#" + video.channel_name}</div>
      );
    }

    const content = (
      <div className='video-card' onClick={this._onClick}>
        <div className='image' style={style} />
        <div className='below-image'>
          {channel}
          <div className='video-name'>{video.title}</div>
          <div className='spacer' />
          <div className='stats'>
            <div className='stat views'>
              <div className='icon views'/>
              <div className='text'>{video.view_count || 0}</div>
            </div>
            <div className='stat messages'>
              <div className='icon messages'/>
              <div className='text'>{video.message_count || 0}</div>
            </div>
          </div>
        </div>
      </div>
    );
    return content;
  }
}
