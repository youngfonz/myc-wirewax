'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import util from './util.js';

import ContentFrame from './components/content_frame.js';
import LoadingOverlay from './components/loading_overlay.js';
import PureComponent from './components/pure_component.js';

import ChannelStore from './stores/channel_store.js';

require('../css/admin_channel.less');

export default class AdminChannelList extends PureComponent {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      channel_list: false,
      in_progress: false,
    };

    DataCortex.event({ kingdom: 'page_view', phylum: 'admin_channel_list' });

    this._onChannelUpdate = this._onChannelUpdate.bind(this);

    this._onChannelAdd = this._onChannelAdd.bind(this);
    this._onDeleteChannel = this._onDeleteChannel.bind(this);
    this._onEditChannel = this._onEditChannel.bind(this);
  }
  componentDidMount() {
    ChannelStore.addChangeListener(this._onChannelUpdate);
    ChannelStore.fetch();
    this._onChannelUpdate();
  }
  componentWillUnmount() {
    ChannelStore.removeChangeListener(this._onChannelUpdate);
  }

  _onChannelAdd() {
    this.context.router.push('/new_private_channel');
  }
  _onChannelUpdate(tag) {
    const channel_list = ChannelStore.getChannels();
    this.setState({ channel_list });
  }
  _onDeleteChannel(channel,e) {
    util.stopAll(e);
    const ok = confirm("Are you sure you want to delete this channel?");
    if (ok) {
      this.setState({ in_progress: true });
      ChannelStore.deleteChannel(channel, (error) => {
        if(!error) {
          alert('Channel deleted.');
        } else {
          alert('Channel could not be deleted, please try again.');
        }
        this.setState({ in_progress: false });
      });
    } else {
      alert('Channel has not been deleted.');
    }
  }
  _onEditChannel(channel) {
    this.context.router.push('/admin/channel/' + channel.channel_id);
  }

  render() {
    const {
      channel_list,
      in_progress,
    } = this.state;

    let content = null;

    if(channel_list === false) {
      content = <LoadingOverlay />;
    } else {
      let loading_overlay = null;
      if (in_progress) {
        loading_overlay = <LoadingOverlay />;
      }

      const channel_rows = _.map(channel_list,(channel) => {
        const channel_id = channel.channel_id;
        const style = {
          backgroundImage: "url(" + channel.channel_image_url + ")",
        };

        let private_channel_icon = null;
        if(channel.is_private) {
          private_channel_icon = <div className="icon-show" />;
        }

        return (
          <div
            key={channel.channel_id}
            className="admin-channel-row"
            onClick={this._onEditChannel.bind(this,channel)}
          >
            <div className="image-column image" style={style}>
              <div className="image-filler" />
            </div>
            <div className="name">
              <div className="private-channel-icon-container">
                {private_channel_icon}
              </div>
              <div className="channel-name">{ channel.channel_name }</div>
            </div>
            <div className="edit" onClick={this._onEditChannel.bind(this,channel)}>
              Edit
            </div>
            <div className="delete" onClick={this._onDeleteChannel.bind(this,channel)}>
              <div className="icon" title="Delete" />
            </div>
          </div>
        );
      });

      content = (
        <ContentFrame className='channel-admin' title="Channel Admin">
          <div className="admin-channel-list">
            <div className='top'>
              <div className='title'>Channels</div>
              <div className='sub-title'>Currently configured channels</div>
              <div className='header-button-container'>
                <div
                  className='header-button'
                  onClick={this._onChannelAdd}>
                  Add Channel
                </div>
              </div>
            </div>
            <div className='admin-channel-row title-row'>
              <div className='image-column'>Channel Image</div>
              <div className='name'>Name</div>
              <div className='edit'>&nbsp;</div>
              <div className='delete'>Delete</div>
            </div>
            {channel_rows}
          </div>
          {loading_overlay}
        </ContentFrame>
      );
    }

    return content;
  }
}
