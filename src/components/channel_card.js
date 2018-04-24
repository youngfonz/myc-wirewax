'use strict';

import React from 'react';

import util from '../util.js';

export default class ChannelCard extends React.Component {
  constructor(props,context) {
    super(props,context);
    this._onClick = this._onClick.bind(this);
  }
  static propTypes = {
    channel: React.PropTypes.object.isRequired,
    onClick: React.PropTypes.func.isRequired,
  };

  _onClick() {
    this.props.onClick(this.props.channel);
  }

  render() {
    const { channel } = this.props;
    const { channel_id } = channel;

    const style = {
      backgroundImage: "url(" + channel.channel_image_url + ")",
    };

    let private_icon;
    if(channel.is_private) {
      private_icon = (
        <div className="private-channel-icon-container">
          <img src="/static/img/lock-grey.png" />
        </div>
      );
    }

    const content = (
      <div className='channel-card' onClick={this._onClick}>
        <div className='image' style={style}>
          <div className='cover' />
        </div>
        <div className='spacer'/>
        <div className='channel-name'>{"#" + channel.channel_name}</div>
        <div className="channel-info-container">
          <div className="channel-stats-container">
            <div className="stat videos">
              <div className="icon videos" />
              <div className="text">{ channel.video_count }</div>
            </div>
          </div>
          { private_icon }
        </div>
      </div>
    );
    return content;
  }
}
