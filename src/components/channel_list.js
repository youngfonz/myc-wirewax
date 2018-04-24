'use strict';

import React from 'react';

import PureComponent from './pure_component.js';
import ChannelCard from './channel_card.js';

import ChannelStore from '../stores/channel_store.js';

require('../../css/channel_list.less');

export default class ChannelList extends PureComponent {
  static propTypes = {
    onChannelClick: React.PropTypes.func.isRequired,
  };
  render() {
    const { channelList } = this.props;

    let list = null;
    if (channelList && channelList.length > 0) {
      list = _.map(channelList,(channel) => {
        const { channel_id } = channel;
        return (
          <ChannelCard
            key={"channel_" + channel_id}
            channel={channel}
            onClick={this.props.onChannelClick}
          />
        );
      });
    }
    const content = (
      <div className='channel-list'>
        {list}
      </div>
    );
    return content;
  }
}
